/**
 * Auto Sync Bot - يزامن حالة جميع المستخدمين النشطين تلقائياً
 *
 * الوظيفة:
 * - يقرأ قائمة المستخدمين النشطين من العقد
 * - يستدعي syncUserState لكل مستخدم
 * - يعمل كل ساعة
 *
 * التشغيل:
 * 1. ضع PRIVATE_KEY في متغيرات البيئة
 * 2. اضبط cron job لتشغيله كل ساعة
 * 3. أو ارفعه على Vercel Cron / GitHub Actions
 */

import { createWalletClient, createPublicClient, http, parseAbi } from "viem";
import { polygon } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";

const CONTRACT_ADDRESS = "0x6DdFbB61A28504713f81eDb0551261cb3DD8Ae1c" as const;
const RPC_URL = "https://polygon-bor-rpc.publicnode.com";
const PRIVATE_KEY = process.env.PRIVATE_KEY || "";

if (!PRIVATE_KEY) {
  console.error("❌ Error: PRIVATE_KEY environment variable is required");
  process.exit(1);
}

const abi = parseAbi([
  "function getActiveUsers() external view returns (address[])",
  "function getActiveUserCount() external view returns (uint256)",
  "function syncUserState(address userAddr) external",
  "function getUserInfo(address userAddr) external view returns (uint128 balance, uint128 lockedAmount, uint64 lastDeductionTime, bool isActive, bool hasWon, uint64 lockedStartTime)",
  "function currentPool() external view returns (uint256)",
]);

const account = privateKeyToAccount(PRIVATE_KEY as `0x${string}`);

const publicClient = createPublicClient({
  chain: polygon,
  transport: http(RPC_URL),
});

const walletClient = createWalletClient({
  chain: polygon,
  transport: http(RPC_URL),
  account,
});

async function autoSync() {
  console.log(`\n[${new Date().toISOString()}] Starting auto-sync...`);

  try {
    // 1. Get all active users
    const activeUsers = (await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi,
      functionName: "getActiveUsers",
    })) as address[];

    console.log(`Found ${activeUsers.length} active users`);

    if (activeUsers.length === 0) {
      console.log("ℹ️ No active users. Exiting.");
      return;
    }

    // 2. Check pool before sync
    const poolBefore = await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi,
      functionName: "currentPool",
    });
    console.log(`Pool before sync: ${Number(poolBefore) / 1e6} USDT`);

    let syncedCount = 0;
    let skippedCount = 0;
    let totalDeducted = 0n;

    // 3. Sync each user
    for (const user of activeUsers) {
      try {
        // Check if user needs sync
        const userInfo = (await publicClient.readContract({
          address: CONTRACT_ADDRESS,
          abi,
          functionName: "getUserInfo",
          args: [user],
        })) as any[];

        const balance = userInfo[0] as bigint;
        const lastDeductionTime = Number(userInfo[2]);
        const now = Math.floor(Date.now() / 1000);
        const elapsed = now - lastDeductionTime;
        const daysElapsed = Math.floor(elapsed / 86400);

        if (daysElapsed === 0 || balance === 0n) {
          skippedCount++;
          continue;
        }

        const expectedDeduction = BigInt(daysElapsed) * 1_000_000n; // $1/day × days
        console.log(`  Syncing ${user}: ${daysElapsed} days, ~$${daysElapsed} deduction`);

        // Call syncUserState
        const hash = await walletClient.writeContract({
          address: CONTRACT_ADDRESS,
          abi,
          functionName: "syncUserState",
          args: [user],
          gas: 200_000n,
        });

        console.log(`  ✅ Tx: https://polygonscan.com/tx/${hash}`);

        // Wait for confirmation
        const receipt = await publicClient.waitForTransactionReceipt({ hash });
        
        if (receipt.status === "success") {
          syncedCount++;
          totalDeducted += expectedDeduction;
        } else {
          console.log(`  ❌ Transaction failed for ${user}`);
        }

        // Small delay between transactions to avoid nonce issues
        await new Promise((resolve) => setTimeout(resolve, 2000));

      } catch (e: any) {
        console.error(`  ❌ Error syncing ${user}:`, e.message);
      }
    }

    // 4. Check pool after sync
    const poolAfter = await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi,
      functionName: "currentPool",
    });

    console.log(`\n=== Sync Summary ===`);
    console.log(`Total users: ${activeUsers.length}`);
    console.log(`Synced: ${syncedCount}`);
    console.log(`Skipped (no pending): ${skippedCount}`);
    console.log(`Pool before: ${Number(poolBefore) / 1e6} USDT`);
    console.log(`Pool after: ${Number(poolAfter) / 1e6} USDT`);
    console.log(`Added to pool: ${Number(poolAfter - poolBefore) / 1e6} USDT`);
    console.log(`\n✅ Auto-sync completed!`);

  } catch (error) {
    console.error(`❌ Fatal error:`, error);
    process.exit(1);
  }
}

// Run the bot
autoSync().then(() => {
  console.log(`\n[${new Date().toISOString()}] Bot finished.`);
  process.exit(0);
});
