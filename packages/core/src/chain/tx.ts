import type { ApiPromise } from "@polkadot/api";
import type { SubmittableExtrinsic } from "@polkadot/api/types";
import type { KeyringPair } from "@polkadot/keyring/types";
import type { ISubmittableResult } from "@polkadot/types/types";

export interface TxResult {
  txHash: string;
  blockHash: string;
  events: string[];
}

/** Sign + broadcast an extrinsic, wait for inclusion, decode dispatch errors. */
export async function submitSigned(
  api: ApiPromise,
  tx: SubmittableExtrinsic<"promise">,
  signer: KeyringPair,
): Promise<TxResult> {
  return new Promise<TxResult>((resolve, reject) => {
    let unsub: (() => void) | undefined;
    tx.signAndSend(signer, (result: ISubmittableResult) => {
      const { status, dispatchError, txHash, events } = result;
      if (dispatchError) {
        let reason = dispatchError.toString();
        if (dispatchError.isModule) {
          const decoded = api.registry.findMetaError(dispatchError.asModule);
          reason = `${decoded.section}.${decoded.name}: ${decoded.docs.join(" ")}`;
        }
        unsub?.();
        reject(new Error(reason));
      } else if (status.isInBlock) {
        const evs = events.map(({ event }) => `${event.section}.${event.method}`);
        unsub?.();
        resolve({ txHash: txHash.toHex(), blockHash: status.asInBlock.toHex(), events: evs });
      }
    })
      .then((u) => {
        unsub = u;
      })
      .catch(reject);
  });
}
