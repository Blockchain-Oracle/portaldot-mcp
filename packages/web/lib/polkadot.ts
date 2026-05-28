"use client";

import { ApiPromise, WsProvider } from "@polkadot/api";
import { potToPlanck } from "./format";

const RPC_URL = process.env.NEXT_PUBLIC_PORTALDOT_RPC_URL ?? "wss://mainnet.portaldot.io";

let apiPromise: Promise<ApiPromise> | null = null;

export function getBrowserApi(): Promise<ApiPromise> {
  if (!apiPromise) {
    apiPromise = ApiPromise.create({ provider: new WsProvider(RPC_URL), noInitWarn: true });
  }
  return apiPromise;
}

export interface TransferResult {
  txHash: string;
  blockHash: string;
}

/** Sign + broadcast a POT transfer with the user's injected wallet. */
export async function signAndSendTransfer(
  fromAddress: string,
  to: string,
  amountPot: string,
): Promise<TransferResult> {
  const api = await getBrowserApi();
  const { web3FromAddress } = await import("@polkadot/extension-dapp");
  const injector = await web3FromAddress(fromAddress);
  const tx = api.tx.balances.transferKeepAlive(to, potToPlanck(amountPot));

  return new Promise<TransferResult>((resolve, reject) => {
    let unsub: (() => void) | undefined;
    tx.signAndSend(fromAddress, { signer: injector.signer }, ({ status, dispatchError, txHash }) => {
      if (dispatchError) {
        let reason = dispatchError.toString();
        if (dispatchError.isModule) {
          const decoded = api.registry.findMetaError(dispatchError.asModule);
          reason = `${decoded.section}.${decoded.name}`;
        }
        unsub?.();
        reject(new Error(reason));
      } else if (status.isInBlock) {
        unsub?.();
        resolve({ txHash: txHash.toHex(), blockHash: status.asInBlock.toHex() });
      }
    })
      .then((u) => {
        unsub = u;
      })
      .catch(reject);
  });
}
