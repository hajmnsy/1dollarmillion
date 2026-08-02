/**
 * Smart Contract Configuration — V4 (Sharia-Compliant, No Aave)
 *
 * POLYGON MAINNET DEPLOYMENT
 * V4 = No Aave, No Riba, No Bonus Draws
 *//**
 * Smart Contract Configuration — V4 (Sharia-Compliant, No Aave)
 *
 * POLYGON MAINNET DEPLOYMENT
 * V4 = No Aave, No Riba, No Bonus Draws
 */

import { polygon } from "wagmi/chains";

// === Contract Addresses (DEPLOYED ON POLYGON MAINNET - V4 Sharia-Compliant) ===
// Deployed on 2026-07-28 via Remix IDE
// V4 = No Aave, No Riba, No Bonus Draws — Sharia Compliant
// Verify: https://polygonscan.com/address/0x6DdFbB61A28504713f81eDb0551261cb3DD8Ae1c
export const LOTTERY_CONTRACT_ADDRESS =
  "0x6DdFbB61A28504713f81eDb0551261cb3DD8Ae1c" as `0x${string}`;

export const USDT_CONTRACT_ADDRESS =
  "0xc2132D05D31c914a87C6611C10748AEb04B58e8F" as `0x${string}`;

// External verification URLs
export const POLYGONSCAN_CONTRACT_URL = `https://polygonscan.com/address/${LOTTERY_CONTRACT_ADDRESS}`;
export const POLYGONSCAN_USDT_URL = `https://polygonscan.com/address/${USDT_CONTRACT_ADDRESS}`;
export const CHAINLINK_VRF_URL = "https://vrf.chain.link/polygon";

export const VRF_SUBSCRIPTION_ID = "5138795994368458865858465733297478458437338427540524283346653360622563975716";

// === Network Config ===
export const TARGET_CHAIN = polygon;
export const TARGET_CHAIN_ID = polygon.id; // 137

// === Token Constants ===
export const TOKEN_DECIMALS = 6;
export const TOKEN_DECIMALS_BI = 10n ** 6n;
export const MIN_DEPOSIT = 1n * TOKEN_DECIMALS_BI;
export const RECOMMENDED_DEPOSIT = 30n * TOKEN_DECIMALS_BI;
export const DAILY_DEDUCTION = 1n * TOKEN_DECIMALS_BI;
export const POOL_TARGET = 1_000_000n * TOKEN_DECIMALS_BI;
export const OPERATIONAL_FEE = 1_000n * TOKEN_DECIMALS_BI;
export const WINNER_LOCK_AMOUNT = 3_650n * TOKEN_DECIMALS_BI;
export const WINNER_PAYOUT = 995_350n * TOKEN_DECIMALS_BI;

// === Contract ABI (V4 - No Aave, No Bonus Draws) ===
export const lotteryAbi = [
  { inputs: [], name: "currentPool", outputs: [{ type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "getActiveUserCount", outputs: [{ type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "getTotalPrincipal", outputs: [{ type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "totalLockedAmounts", outputs: [{ type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "accumulatedFees", outputs: [{ type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "totalUserBalances", outputs: [{ type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "regularDrawCount", outputs: [{ type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "drawInProgress", outputs: [{ type: "bool" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "paused", outputs: [{ type: "bool" }], stateMutability: "view", type: "function" },
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
      { name: "totalBalance", type: "uint256" },
      { name: "userBalances", type: "uint256" },
      { name: "poolAmount", type: "uint256" },
      { name: "lockedAmounts", type: "uint256" },
      { name: "fees", type: "uint256" },
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
      { name: "winner", type: "address" },
      { name: "randomNumber", type: "uint256" },
      { name: "activeUserCount", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
  // === Write functions (V4 with referral support) ===
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
  { inputs: [{ name: "amount", type: "uint256" }], name: "withdraw", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ name: "userAddr", type: "address" }], name: "syncUserState", outputs: [], stateMutability: "nonpayable", type: "function" },
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
  // === Events (for activity feed) ===
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "user", type: "address" },
      { indexed: false, name: "amount", type: "uint256" },
      { indexed: false, name: "newBalance", type: "uint256" },
      { indexed: false, name: "newPool", type: "uint256" },
    ],
    name: "Deposited",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "user", type: "address" },
      { indexed: false, name: "amount", type: "uint256" },
      { indexed: false, name: "newBalance", type: "uint256" },
    ],
    name: "Withdrawn",
    type: "event",
  },
] as const;

// === USDT ABI (minimal) ===
export const usdtAbi = [
  { inputs: [{ type: "address" }], name: "balanceOf", outputs: [{ type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [{ type: "address" }, { type: "address" }], name: "allowance", outputs: [{ type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [{ type: "address" }, { type: "uint256" }], name: "approve", outputs: [{ type: "bool" }], stateMutability: "nonpayable", type: "function" },
] as const;

// === Types ===
export type UserInfo = {
  balance: bigint;
  lockedAmount: bigint;
  lastDeductionTime: bigint;
  isActive: boolean;
  hasWon: boolean;
  lockedStartTime: bigint;
};

// V4 accounting summary (no yield/solvencyGap)
export type AccountingSummary = {
  totalBalance: bigint;
  userBalances: bigint;
  poolAmount: bigint;
  lockedAmounts: bigint;
  fees: bigint;
};

export type VrfRequest = {
  exists: boolean;
  fulfilled: boolean;
  winner: `0x${string}`;
  randomNumber: bigint;
  activeUserCount: bigint;
};


import { polygon } from "wagmi/chains";

// === Contract Addresses (DEPLOYED ON POLYGON MAINNET - V4 Sharia-Compliant) ===
// Deployed on 2026-07-28 via Remix IDE
// V4 = No Aave, No Riba, No Bonus Draws — Sharia Compliant
// Verify: https://polygonscan.com/address/0x6DdFbB61A28504713f81eDb0551261cb3DD8Ae1c
export const LOTTERY_CONTRACT_ADDRESS =
  "0x6DdFbB61A28504713f81eDb0551261cb3DD8Ae1c" as `0x${string}`;

export const USDT_CONTRACT_ADDRESS =
  "0xc2132D05D31c914a87C6611C10748AEb04B58e8F" as `0x${string}`;

// External verification URLs
export const POLYGONSCAN_CONTRACT_URL = `https://polygonscan.com/address/${LOTTERY_CONTRACT_ADDRESS}`;
export const POLYGONSCAN_USDT_URL = `https://polygonscan.com/address/${USDT_CONTRACT_ADDRESS}`;
export const CHAINLINK_VRF_URL = "https://vrf.chain.link/polygon";

export const VRF_SUBSCRIPTION_ID = "5138795994368458865858465733297478458437338427540524283346653360622563975716";

// === Network Config ===
export const TARGET_CHAIN = polygon;
export const TARGET_CHAIN_ID = polygon.id; // 137

// === Token Constants ===
export const TOKEN_DECIMALS = 6;
export const TOKEN_DECIMALS_BI = 10n ** 6n;
export const MIN_DEPOSIT = 1n * TOKEN_DECIMALS_BI;
export const RECOMMENDED_DEPOSIT = 30n * TOKEN_DECIMALS_BI;
export const DAILY_DEDUCTION = 1n * TOKEN_DECIMALS_BI;
export const POOL_TARGET = 1_000_000n * TOKEN_DECIMALS_BI;
export const OPERATIONAL_FEE = 1_000n * TOKEN_DECIMALS_BI;
export const WINNER_LOCK_AMOUNT = 3_650n * TOKEN_DECIMALS_BI;
export const WINNER_PAYOUT = 995_350n * TOKEN_DECIMALS_BI;

// === Contract ABI (V4 - No Aave, No Bonus Draws) ===
export const lotteryAbi = [
  { inputs: [], name: "currentPool", outputs: [{ type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "getActiveUserCount", outputs: [{ type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "getTotalPrincipal", outputs: [{ type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "totalLockedAmounts", outputs: [{ type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "accumulatedFees", outputs: [{ type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "totalUserBalances", outputs: [{ type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "regularDrawCount", outputs: [{ type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "drawInProgress", outputs: [{ type: "bool" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "paused", outputs: [{ type: "bool" }], stateMutability: "view", type: "function" },
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
      { name: "totalBalance", type: "uint256" },
      { name: "userBalances", type: "uint256" },
      { name: "poolAmount", type: "uint256" },
      { name: "lockedAmounts", type: "uint256" },
      { name: "fees", type: "uint256" },
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
      { name: "winner", type: "address" },
      { name: "randomNumber", type: "uint256" },
      { name: "activeUserCount", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
  // === Write functions (V4 with referral support) ===
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
  { inputs: [{ name: "amount", type: "uint256" }], name: "withdraw", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ name: "userAddr", type: "address" }], name: "syncUserState", outputs: [], stateMutability: "nonpayable", type: "function" },
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
  // === Events (for activity feed) ===
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "user", type: "address" },
      { indexed: false, name: "amount", type: "uint256" },
      { indexed: false, name: "newBalance", type: "uint256" },
      { indexed: false, name: "newPool", type: "uint256" },
    ],
    name: "Deposited",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "user", type: "address" },
      { indexed: false, name: "amount", type: "uint256" },
      { indexed: false, name: "newBalance", type: "uint256" },
    ],
    name: "Withdrawn",
    type: "event",
  },
] as const;

// === USDT ABI (minimal) ===
export const usdtAbi = [
  { inputs: [{ type: "address" }], name: "balanceOf", outputs: [{ type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [{ type: "address" }, { type: "address" }], name: "allowance", outputs: [{ type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [{ type: "address" }, { type: "uint256" }], name: "approve", outputs: [{ type: "bool" }], stateMutability: "nonpayable", type: "function" },
] as const;

// === Types ===
export type UserInfo = {
  balance: bigint;
  lockedAmount: bigint;
  lastDeductionTime: bigint;
  isActive: boolean;
  hasWon: boolean;
  lockedStartTime: bigint;
};

// V4 accounting summary (no yield/solvencyGap)
export type AccountingSummary = {
  totalBalance: bigint;
  userBalances: bigint;
  poolAmount: bigint;
  lockedAmounts: bigint;
  fees: bigint;
};

export type VrfRequest = {
  exists: boolean;
  fulfilled: boolean;
  winner: `0x${string}`;
  randomNumber: bigint;
  activeUserCount: bigint;
};
