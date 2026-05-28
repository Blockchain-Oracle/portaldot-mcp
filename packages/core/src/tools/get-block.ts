import { z } from "zod";
import { defineTool } from "../lib/tool";
import { getApi } from "../chain/connection";
import { ok, err } from "../lib/result";

export const getBlockInfo = defineTool({
  name: "portaldot_get_block_info",
  description:
    "Get Portaldot block info (number, hash, unix-ms timestamp, extrinsic count). Omit blockNumber for the latest block.",
  inputShape: {
    blockNumber: z.number().int().nonnegative().optional().describe("Block height; latest if omitted"),
  },
  handler: async ({ blockNumber }) => {
    try {
      const api = await getApi();
      const hash =
        blockNumber === undefined
          ? await api.rpc.chain.getBlockHash()
          : await api.rpc.chain.getBlockHash(blockNumber);
      const signedBlock = await api.rpc.chain.getBlock(hash);
      const apiAt = await api.at(hash);
      const ts = await apiAt.query.timestamp.now();
      return ok({
        number: signedBlock.block.header.number.toNumber(),
        hash: hash.toHex(),
        timestamp: Number(ts.toString()),
        extrinsics: signedBlock.block.extrinsics.length,
      });
    } catch (e) {
      return err(`get_block_info failed: ${String(e)}`);
    }
  },
});
