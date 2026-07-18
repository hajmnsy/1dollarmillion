/**
 * Smart Contract Configuration
 *
 * SEPOLIA TESTNET DEPLOYMENT
 * ---------------------------
 * The addresses below are placeholders. After running `DeploySepolia.s.sol`,
 * replace them with the addresses printed in the deployment summary.
 *
 * Target network: Sepolia Testnet (Chain ID: 11155111)
 * RPC: https://ethereum-sepolia-rpc.publicnode.com
 * Explorer: https://sepolia.etherscan.io
 */

import { mainnet, polygon, sepolia } from "wagmi/chains";

// === Contract Addresses (DEPLOYED ON POLYGON MAINNET - V3 with VRF v2.5) ===
// Deployed on 2026-07-16 via Remix IDE
// Verify: https://polygonscan.com/address/0xcf8e2713FCD5653B4Bf9d440CF43c5F05524365F
export const LOTTERY_CONTRACT_ADDRESS =
  "0xcf8e2713FCD5653B4Bf9d440CF43c5F05524365F" as `0x${string}`;

// USDT on Polygon Mainnet (real USDT, 6 decimals)
export const USDT_CONTRACT_ADDRESS =
  "0xc2132D05D31c914a87C6611C10748AEb04B58e8F" as `0x${string}`;

// External verification URLs (Polygon Mainnet)
export const POLYGONSCAN_CONTRACT_URL = `https://polygonscan.com/address/${LOTTERY_CONTRACT_ADDRESS}`;
export const POLYGONSCAN_USDT_URL = `https://polygonscan.com/address/${USDT_CONTRACT_ADDRESS}`;
export const AAVE_POOL_URL = "https://app.aave.com/reserve-overview/?underlyingAsset=0xc2132d05d31c914a87c6611c10748aeb04b58e8f&marketName=proto_polygon_v3";
export const CHAINLINK_VRF_URL = "https://vrf.chain.link/polygon";

// VRF Subscription ID for transparency
export const VRF_SUBSCRIPTION_ID = "5138795994368458865858465733297478458437338427540524283346653360622563975716";

// === Network Config =================================================
// Sepolia testnet — switch to `mainnet` for production deployment.
export const TARGET_CHAIN = polygon;
export const TARGET_CHAIN_ID = polygon.id; // 137

// === Token Constants (mirror contract) ==============================
export const TOKEN_DECIMALS = 6;
export const TOKEN_DECIMALS_BI = 10n ** 6n;
export const MIN_DEPOSIT = 1n * TOKEN_DECIMALS_BI;          // 1 USDT
export const RECOMMENDED_DEPOSIT = 30n * TOKEN_DECIMALS_BI; // 30 USDT
export const DAILY_DEDUCTION = 1n * TOKEN_DECIMALS_BI;      // 1 USDT/day
export const POOL_TARGET = 1_000_000n * TOKEN_DECIMALS_BI;  // 1,000,000 USDT
export const BONUS_DRAW_TARGET = 1_000_000n * TOKEN_DECIMALS_BI;
export const OPERATIONAL_FEE = 1_000n * TOKEN_DECIMALS_BI;
export const WINNER_LOCK_AMOUNT = 3_650n * TOKEN_DECIMALS_BI;
export const WINNER_PAYOUT = 995_350n * TOKEN_DECIMALS_BI;

// === Contract ABI (only the functions the frontend needs) ===========
// Pruned from HybridRoscaLotteryV2.1.1 (1DollarMillion) — read functions + write hooks.
// Adding only what the UI consumes keeps the bundle small.
export const lotteryAbi = [
  {
    inputs: [],
    name: "currentPool",
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getYieldBalance",
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getActiveUserCount",
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getTotalPrincipal",
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalLockedAmounts",
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "accumulatedFees",
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalUserBalances",
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "regularDrawCount",
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "bonusDrawCount",
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "drawInProgress",
    outputs: [{ type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "paused",
    outputs: [{ type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ type: "address" }],
    name: "getUserInfo",
    outputs: [
      { name: "balance", type: "uint128" },
      { name: "lockedAmount", type: "uint128" },
      { name: "lastDeductionTime", type: "uint64" },
      { name: "isActive", type: "bool" },
      { name: "hasWon", type: "bool" },
      { name: "lockedStartTime", type: "uint64" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "accountingSummary",
    outputs: [
      { name: "principal", type: "uint256" },
      { name: "yield_", type: "uint256" },
      { name: "usdtBalance", type: "uint256" },
      { name: "aUsdtBalance", type: "uint256" },
      { name: "totalAssets", type: "uint256" },
      { name: "solvencyGap", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ type: "uint256" }],
    name: "vrfRequests",
    outputs: [
      { name: "exists", type: "bool" },
      { name: "fulfilled", type: "bool" },
      { name: "isBonus", type: "bool" },
      { name: "winner", type: "address" },
      { name: "randomNumber", type: "uint256" },
      { name: "activeUserCount", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
  // === Write functions (V3 with referral support) ===
  {
    inputs: [
      { name: "amount", type: "uint256" },
      { name: "referrer", type: "address" },
    ],
    name: "deposit",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "amount", type: "uint256" }],
    name: "withdraw",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "userAddr", type: "address" }],
    name: "syncUserState",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "userAddr", type: "address" }],
    name: "getReferralInfo",
    outputs: [
      { name: "referrer", type: "address" },
      { name: "referralCount", type: "uint256" },
      { name: "referralEarnings", type: "uint256" },
      { name: "bonusDays", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;

// === USDT ABI (minimal) =============================================
export const usdtAbi = [
  {
    inputs: [{ type: "address" }],
    name: "balanceOf",
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ type: "address" }, { type: "address" }],
    name: "allowance",
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ type: "address" }, { type: "uint256" }],
    name: "approve",
    outputs: [{ type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

// === Types ==========================================================
export type UserInfo = {
  balance: bigint;
  lockedAmount: bigint;
  lastDeductionTime: bigint;
  isActive: boolean;
  hasWon: boolean;
  lockedStartTime: bigint;
};

export type AccountingSummary = {
  principal: bigint;
  yield_: bigint;
  usdtBalance: bigint;
  aUsdtBalance: bigint;
  totalAssets: bigint;
  solvencyGap: bigint;
};

export type VrfRequest = {
  exists: boolean;
  fulfilled: boolean;
  isBonus: boolean;
  winner: `0x${string}`;
  randomNumber: bigint;
  activeUserCount: bigint;
};
