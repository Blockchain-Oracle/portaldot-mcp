import type { ToolDef } from "./lib/types";
import { getBalance } from "./tools/get-balance";
import { getBlockInfo } from "./tools/get-block";
import { estimateFee } from "./tools/estimate-fee";
import { transfer } from "./tools/transfer";
import { createTask, completeTask, listTasks, getTask } from "./tools/task-ledger";
import { createToken, mintToken, transferToken, tokenInfo, myTokens } from "./tools/tokens";
import {
  callContractTool,
  readContractTool,
  dryRunContractTool,
  decodeContractMetadataTool,
} from "./tools/contract-toolkit";
import { stake, validators, stakingInfo } from "./tools/staking";
import { setIdentity, resolveAddress } from "./tools/identity";
import {
  addProxy,
  listProxies,
  proposeBounty,
  listBounties,
  multisigAddress,
} from "./tools/proxy-bounties";
import { accountOverview, chainInfo } from "./tools/account";
import { generateAccount, validateAddress, convertAddress } from "./tools/utils";

/**
 * All Portaldot tools, transport-agnostic. The `mcp` and `web` packages each
 * adapt this list to their own tool-registration surface.
 */
export const allTools: ToolDef[] = [
  getBalance,
  getBlockInfo,
  estimateFee,
  transfer,
  createTask,
  completeTask,
  listTasks,
  getTask,
  createToken,
  mintToken,
  transferToken,
  tokenInfo,
  myTokens,
  callContractTool,
  readContractTool,
  dryRunContractTool,
  decodeContractMetadataTool,
  stake,
  validators,
  stakingInfo,
  setIdentity,
  resolveAddress,
  addProxy,
  listProxies,
  proposeBounty,
  listBounties,
  multisigAddress,
  accountOverview,
  chainInfo,
  generateAccount,
  validateAddress,
  convertAddress,
];
