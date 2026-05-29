// The 34 Portaldot MCP tools, grouped for the /docs catalog. `prompt` is a
// plain-language example a user can paste into any MCP client; `wallet` marks
// tools that sign a transaction (need a funded signer).

export interface ToolEntry {
  name: string;
  label: string;
  description: string;
  prompt: string;
  wallet?: boolean;
}

export interface ToolCategory {
  id: string;
  label: string;
  blurb: string;
  tools: ToolEntry[];
}

export const TOOL_CATALOG: ToolCategory[] = [
  {
    id: "reads",
    label: "Chain reads",
    blurb: "Query live Portaldot state — no wallet, no gas.",
    tools: [
      { name: "portaldot_get_balance", label: "Get balance", description: "Free / reserved / total POT for any address.", prompt: "What's the balance of my account?" },
      { name: "portaldot_account_overview", label: "Account overview", description: "Balance + identity + staking + nonce in one shot.", prompt: "Give me a full overview of my account" },
      { name: "portaldot_get_block_info", label: "Block info", description: "Latest (or a specific) block: number, hash, extrinsics, time.", prompt: "Show me the latest Portaldot block" },
      { name: "portaldot_chain_info", label: "Network status", description: "Token, decimals, ss58, issuance, era, best block, validator count.", prompt: "What's the Portaldot network status right now?" },
      { name: "portaldot_estimate_fee", label: "Estimate fee", description: "Estimate the fee for a transfer before signing.", prompt: "Estimate the fee to send 1 POT to 5FHne…" },
      { name: "portaldot_validators", label: "Validators", description: "The active validator set.", prompt: "Who are the active validators?" },
      { name: "portaldot_staking_info", label: "Staking info", description: "Bonded amount, nominations, and era for an address.", prompt: "Show my staking info" },
      { name: "portaldot_resolve_address", label: "Resolve identity", description: "On-chain identity (display, judgements) for an address.", prompt: "Resolve my on-chain identity" },
      { name: "portaldot_watch_balance", label: "Watch balance", description: "Subscribe to an address and report balance changes live (bounded).", prompt: "Watch my balance for 30 seconds" },
    ],
  },
  {
    id: "transfers",
    label: "Transfers",
    blurb: "Move POT. Signed in your wallet — the server never holds keys.",
    tools: [
      { name: "portaldot_transfer", label: "Transfer POT", description: "Send POT to one recipient. You review and sign.", prompt: "Send 1 POT to 5FHneW46…", wallet: true },
      { name: "portaldot_batch_transfer", label: "Batch transfer", description: "Send POT to many recipients in one atomic batch.", prompt: "Send 1 POT to 5FHne… and 2 POT to 5FLSi…", wallet: true },
    ],
  },
  {
    id: "tokens",
    label: "Tokens (assets)",
    blurb: "Create and manage pallet-assets tokens.",
    tools: [
      { name: "portaldot_token_info", label: "Token info", description: "Name, symbol, decimals, supply, owner for an asset id.", prompt: "Show token info for asset 1" },
      { name: "portaldot_my_tokens", label: "My tokens", description: "All assets an address owns.", prompt: "List the tokens I own" },
      { name: "portaldot_create_token", label: "Create token", description: "Create a new asset with metadata + initial supply.", prompt: "Create a token called Demo (DEMO) with 1,000,000 supply", wallet: true },
      { name: "portaldot_mint_token", label: "Mint token", description: "Mint more of an asset you control.", prompt: "Mint 500 DEMO to my account", wallet: true },
      { name: "portaldot_transfer_token", label: "Transfer token", description: "Send an asset to another address.", prompt: "Send 10 DEMO to 5FHne…", wallet: true },
    ],
  },
  {
    id: "staking-identity",
    label: "Staking & identity",
    blurb: "Bond stake and set your on-chain identity.",
    tools: [
      { name: "portaldot_stake", label: "Stake", description: "Bond POT to begin staking.", prompt: "Stake 10 POT", wallet: true },
      { name: "portaldot_set_identity", label: "Set identity", description: "Set your on-chain display name and metadata.", prompt: "Set my identity display name to abu", wallet: true },
    ],
  },
  {
    id: "governance",
    label: "Proxy & governance",
    blurb: "Delegate with proxies and propose bounties.",
    tools: [
      { name: "portaldot_list_proxies", label: "List proxies", description: "Proxy delegations for an address.", prompt: "List my proxies" },
      { name: "portaldot_add_proxy", label: "Add proxy", description: "Delegate authority to a proxy account.", prompt: "Add 5FHne… as an Any proxy", wallet: true },
      { name: "portaldot_list_bounties", label: "List bounties", description: "Open treasury bounties.", prompt: "List the open bounties" },
      { name: "portaldot_propose_bounty", label: "Propose bounty", description: "Propose a new treasury bounty.", prompt: "Propose a 100 POT bounty: write docs", wallet: true },
    ],
  },
  {
    id: "tasks",
    label: "Task Ledger (ink!)",
    blurb: "An on-chain task list, backed by an ink! v5 contract.",
    tools: [
      { name: "portaldot_list_tasks", label: "List tasks", description: "All tasks owned by an address.", prompt: "List my onchain tasks" },
      { name: "portaldot_get_task", label: "Get task", description: "A single task by id.", prompt: "Show task 1" },
      { name: "portaldot_create_task", label: "Create task", description: "Add a task to the ledger.", prompt: "Create a task: ship the demo", wallet: true },
      { name: "portaldot_complete_task", label: "Complete task", description: "Mark a task done.", prompt: "Complete task 1", wallet: true },
    ],
  },
  {
    id: "contracts",
    label: "Contracts (ink!)",
    blurb: "Read, dry-run, and call any ink! contract.",
    tools: [
      { name: "portaldot_read_contract", label: "Read contract", description: "Call a read-only contract message.", prompt: "Read get_count from contract 5Grw…" },
      { name: "portaldot_dry_run_contract", label: "Dry-run contract", description: "Simulate a contract call (gas + result) without signing.", prompt: "Dry-run increment on contract 5Grw…" },
      { name: "portaldot_call_contract", label: "Call contract", description: "Submit a state-changing contract call.", prompt: "Call increment on contract 5Grw…", wallet: true },
      { name: "portaldot_decode_contract_metadata", label: "Decode metadata", description: "Inspect a contract's messages from its metadata JSON.", prompt: "Decode the metadata for my contract" },
    ],
  },
  {
    id: "utilities",
    label: "Accounts & utilities",
    blurb: "Address tooling and account generation.",
    tools: [
      { name: "portaldot_validate_address", label: "Validate address", description: "Check an address is valid for ss58 prefix 42.", prompt: "Is 5FHne… a valid Portaldot address?" },
      { name: "portaldot_convert_address", label: "Convert address", description: "Re-encode an address to a given ss58 prefix.", prompt: "Convert 5FHne… to ss58 prefix 0" },
      { name: "portaldot_generate_account", label: "Generate account", description: "Create a fresh keypair + mnemonic.", prompt: "Generate a new Portaldot account" },
      { name: "portaldot_multisig_address", label: "Multisig address", description: "Compute a multisig address from signatories + threshold.", prompt: "Compute the 2-of-3 multisig for these addresses" },
    ],
  },
];

export const TOOL_COUNT = TOOL_CATALOG.reduce((n, c) => n + c.tools.length, 0);
