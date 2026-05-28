import type { ApiPromise } from "@polkadot/api";
import { ContractPromise } from "@polkadot/api-contract";
import type { KeyringPair } from "@polkadot/keyring/types";
import type { WeightV2 } from "@polkadot/types/interfaces";
import { readFileSync } from "node:fs";

// Generous caps for dry-run queries; real tx gas comes from the dry-run estimate.
const REF_TIME_CAP = 10_000_000_000_000n;
const PROOF_SIZE_CAP = 5_000_000n;

export function loadContract(
  api: ApiPromise,
  metadata: string | Record<string, unknown>,
  address: string,
): ContractPromise {
  return new ContractPromise(api, metadata, address);
}

/** Load the deployed Task Ledger from env (address + metadata JSON path). */
export function getTaskLedger(api: ApiPromise): ContractPromise {
  const address = process.env.TASK_LEDGER_CONTRACT_ADDRESS;
  const metaPath = process.env.TASK_LEDGER_METADATA_PATH;
  if (!address) throw new Error("TASK_LEDGER_CONTRACT_ADDRESS is not set");
  if (!metaPath) throw new Error("TASK_LEDGER_METADATA_PATH is not set");
  const metadata = JSON.parse(readFileSync(metaPath, "utf8")) as Record<string, unknown>;
  return new ContractPromise(api, metadata, address);
}

function gasCap(api: ApiPromise): WeightV2 {
  return api.registry.createType("WeightV2", {
    refTime: REF_TIME_CAP,
    proofSize: PROOF_SIZE_CAP,
  }) as unknown as WeightV2;
}

// ink! messages return Result<T, LangError>; api-contract sometimes surfaces the
// raw `{ ok: value }` wrapper. Unwrap it so callers get the plain value.
function unwrap(value: unknown): unknown {
  if (value && typeof value === "object" && "ok" in value) {
    return (value as { ok: unknown }).ok;
  }
  if (value && typeof value === "object" && "Ok" in value) {
    return (value as { Ok: unknown }).Ok;
  }
  return value;
}

/** Read-only contract query (dry-run, no signing). Returns the decoded output. */
export async function queryContract(
  api: ApiPromise,
  contract: ContractPromise,
  origin: string,
  method: string,
  args: unknown[],
): Promise<unknown> {
  const fn = contract.query[method];
  if (!fn) throw new Error(`contract has no message '${method}'`);
  const { result, output } = await fn(
    origin,
    { gasLimit: gasCap(api), storageDepositLimit: null },
    ...args,
  );
  if (result.isErr) throw new Error(`query '${method}' reverted: ${result.asErr.toString()}`);
  return unwrap(output?.toJSON());
}

/** Dry-run a contract message: returns the would-be output + estimated gas, no broadcast. */
export async function dryRunQuery(
  api: ApiPromise,
  contract: ContractPromise,
  origin: string,
  method: string,
  args: unknown[],
): Promise<{ output: unknown; gasRequired: unknown }> {
  const fn = contract.query[method];
  if (!fn) throw new Error(`contract has no message '${method}'`);
  const { result, output, gasRequired } = await fn(
    origin,
    { gasLimit: gasCap(api), storageDepositLimit: null },
    ...args,
  );
  if (result.isErr) throw new Error(`dry-run of '${method}' reverted: ${result.asErr.toString()}`);
  return { output: unwrap(output?.toJSON()), gasRequired: gasRequired.toHuman() };
}

export interface ContractTxResult {
  output: unknown;
  txHash: string;
  blockHash: string;
}

/** Sign + send a contract message. Dry-runs first to estimate gas and capture the return value. */
export async function callContract(
  api: ApiPromise,
  contract: ContractPromise,
  signer: KeyringPair,
  method: string,
  args: unknown[],
): Promise<ContractTxResult> {
  const queryFn = contract.query[method];
  const txFn = contract.tx[method];
  if (!queryFn || !txFn) throw new Error(`contract has no message '${method}'`);

  const dry = await queryFn(
    signer.address,
    { gasLimit: gasCap(api), storageDepositLimit: null },
    ...args,
  );
  if (dry.result.isErr) {
    throw new Error(`'${method}' would revert: ${dry.result.asErr.toString()}`);
  }
  const output = unwrap(dry.output?.toJSON());

  const tx = txFn({ gasLimit: dry.gasRequired, storageDepositLimit: null }, ...args);

  return await new Promise<ContractTxResult>((resolve, reject) => {
    let unsub: (() => void) | undefined;
    tx.signAndSend(signer, ({ status, dispatchError, txHash }) => {
      if (dispatchError) {
        let reason = dispatchError.toString();
        if (dispatchError.isModule) {
          const decoded = api.registry.findMetaError(dispatchError.asModule);
          reason = `${decoded.section}.${decoded.name}: ${decoded.docs.join(" ")}`;
        }
        unsub?.();
        reject(new Error(`'${method}' reverted: ${reason}`));
      } else if (status.isInBlock) {
        unsub?.();
        resolve({ output, txHash: txHash.toHex(), blockHash: status.asInBlock.toHex() });
      }
    })
      .then((u) => {
        unsub = u;
      })
      .catch(reject);
  });
}
