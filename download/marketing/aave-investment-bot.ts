/**
 * Aave Investment Bot - يستثمر الفائض في Aave V3 دورياً
 *
 * الوظيفة:
 * - يفحص العقد كل ساعة
 * - إذا كان هناك فائض (excess liquidity) → يستدعي supplyToAave()
 * - يسجّل كل عملية في ملف log
 *
 * التشغيل:
 * 1. ضع هذا الملف في Vercel أو GitHub Actions
 * 2. اضبط المتغيرات البيئية (PRIVATE_KEY)
 * 3. شغّله كل ساعة عبر cron
 */

import { createWalletClient, createPublicClient, http, parseAbi } from "viem";
import { polygon } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";

// === الإعدادات ===
const CONTRACT_ADDRESS = "0xcf8e2713FCD5653B4Bf9d440CF43c5F05524365F" as const;
const RPC_URL = "https://polygon-bor-rpc.publicnode.com";

// المفتاح الخاص (ضععه في متغير بيئي)
const PRIVATE_KEY = process.env.PRIVATE_KEY || "";

if (!PRIVATE_KEY) {
  console.error("❌ Error: PRIVATE_KEY environment variable is required");
  process.exit(1);
}

// === ABI المختصر ===
const abi = parseAbi([
  "function getExcessLiquidity() external view returns (uint256)",
  "function supplyToAave(uint256 amount) external nonReentrant",
  "function totalPrincipalSupplied() external view returns (uint256)",
  "function getYieldBalance() external view returns (uint256)",
]);

// === إنشاء العملاء ===
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

// === الدالة الرئيسية ===
async function investInAave() {
  console.log(`\n[${new Date().toISOString()}] Starting Aave investment check...`);

  try {
    // 1. فحص الفائض المتاح للاستثمار
    const excessLiquidity = (await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi,
      functionName: "getExcessLiquidity",
    })) as bigint;

    console.log(`Excess Liquidity: ${Number(excessLiquidity) / 1e6} USDT`);

    if (excessLiquidity === 0n) {
      console.log("ℹ️ No excess liquidity to invest. Skipping.");
      return;
    }

    // 2. فحص الحالة الحالية قبل الاستثمار
    const principalBefore = (await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi,
      functionName: "totalPrincipalSupplied",
    })) as bigint;

    const yieldBefore = (await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi,
      functionName: "getYieldBalance",
    })) as bigint;

    console.log(`Before investment:`);
    console.log(`  Principal in Aave: ${Number(principalBefore) / 1e6} USDT`);
    console.log(`  Yield earned: ${Number(yieldBefore) / 1e6} USDT`);

    // 3. استدعاء supplyToAave(type(uint256).max) لإيداع كل الفائض
    console.log(`Investing ${Number(excessLiquidity) / 1e6} USDT into Aave V3...`);

    const hash = await walletClient.writeContract({
      address: CONTRACT_ADDRESS,
      abi,
      functionName: "supplyToAave",
      args: [excessLiquidity], // إيداع كل الفائض
      gas: 500000n,
    });

    console.log(`✅ Transaction submitted: ${hash}`);
    console.log(`   View on Polygonscan: https://polygonscan.com/tx/${hash}`);

    // 4. انتظار تأكيد المعاملة
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    console.log(`✅ Transaction confirmed in block ${receipt.blockNumber}`);

    // 5. فحص الحالة بعد الاستثمار
    const principalAfter = (await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi,
      functionName: "totalPrincipalSupplied",
    })) as bigint;

    const yieldAfter = (await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi,
      functionName: "getYieldBalance",
    })) as bigint;

    console.log(`\nAfter investment:`);
    console.log(`  Principal in Aave: ${Number(principalAfter) / 1e6} USDT`);
    console.log(`  Yield earned: ${Number(yieldAfter) / 1e6} USDT`);
    console.log(`  Increase: ${Number(principalAfter - principalBefore) / 1e6} USDT`);

    console.log(`\n✅ Investment completed successfully!`);

  } catch (error) {
    console.error(`❌ Error:`, error);
    
    // تسجيل الخطأ
    if (error instanceof Error) {
      console.error(`Message: ${error.message}`);
    }
  }
}

// === تشغيل البوت ===
investInAave().then(() => {
  console.log(`\n[${new Date().toISOString()}] Bot finished.`);
  process.exit(0);
});
