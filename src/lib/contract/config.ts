/**
 * Smart Contract Configuration
 *
 * IMPORTANT: The address below is a placeholder for SEPOLIA TESTNET.
 * Replace with the actual deployed V2.1.1 contract address before going live.
 */

import { mainnet, sepolia } from "wagmi/chains";

// === Contract Addresses (REPLACE BEFORE MAINNET) =====================
export const LOTTERY_CONTRACT_ADDRESS =
  "0x0000000000000000000000000000000000000001" as `0x${string}`;

export const USDT_CONTRACT_ADDRESS =
  "0x0000000000000000000000000000000000000002" as `0x${string}`;

// === Network Config =================================================
// Default to sepolia for development. Switch to mainnet for production.
export const TARGET_CHAIN = sepolia;
export const TARGET_CHAIN_ID = sepolia.id;

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
// Pruned from HybridRoscaLotteryV2.1.1 — read functions + write hooks.
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
  // === Write functions (for Phase 3) ===
  {
    inputs: [{ name: "amount", type: "uint256" }],
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
