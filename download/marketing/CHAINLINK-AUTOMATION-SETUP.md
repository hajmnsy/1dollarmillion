# 🤖 Chainlink Automation - السحب التلقائي

## 📋 نظرة عامة

Chainlink Automation سيقوم تلقائياً بـ:
1. مراقبة العقد كل دقيقة
2. عندما يصل `currentPool` إلى $1,000,000 → يستدعي `triggerDrawIfTargetReached()`
3. السحب يحدث تلقائياً عبر Chainlink VRF

---

## 🚀 خطوات الإعداد:

### الخطوة 1: اذهب إلى Chainlink Automation

افتح: **https://automation.chain.link/**

### الخطوة 2: سجّل الدخول واربط محفظتك

1. اضغط **"Connect Wallet"**
2. اربط MetaMask (نفس المحفظة التي نشرت بها العقد)
3. تأكد أنك على شبكة **Polygon Mainnet**

### الخطونة 3: أنشئ Automation جديد

1. اضغط **"Register New Upkeep"**
2. اختر نوع: **"Custom Logic"**
3. املأ البيانات:

| الحقل | القيمة |
|------|--------|
| **Name** | `1DollarMillion Draw Trigger` |
| **Contract Address** | `0xcf8e2713FCD5653B4Bf9d440CF43c5F05524365F` |
| **Gas Limit** | `500000` |
| **Starting Balance (LINK)** | `10` (أو حسب رغبتك) |

### الخطوة 4: ارفع كود الـ Upkeep

في صندوق **"Check Data"**، الصق:

```javascript
// Chainlink Automation - Check Function
// Returns true when pool reaches $1M target

const LOTTERY_CONTRACT = "0xcf8e2713FCD5653B4Bf9d440CF43c5F05524365F";
const POOL_TARGET = "1000000000000"; // $1,000,000 in 6 decimals

// Read currentPool from contract
const pool = await ethers.provider.call({
  to: LOTTERY_CONTRACT,
  data: "0x" + ethers.utils.id("currentPool()").slice(0, 8)
});

const currentPool = BigInt(pool);
const target = BigInt(POOL_TARGET);

// Trigger upkeep when pool reaches target
const needsDraw = currentPool >= target;

return {
  needsDraw,
  performData: needsDraw ? "0x" : "0x00"
};
```

### الخطوة 5: اضبط الـ Perform Function

في صندوق **"Perform Function"**، الصق:

```javascript
// Chainlink Automation - Perform Function
// Calls triggerDrawIfTargetReached() when needed

const LOTTERY_CONTRACT = "0xcf8e2713FCD5653B4Bf9d440CF43c5F05524365F";

// ABI for triggerDrawIfTargetReached
const abi = [
  {
    "inputs": [],
    "name": "triggerDrawIfTargetReached",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

const contract = new ethers.Contract(LOTTERY_CONTRACT, abi, signer);

// Call the trigger function
const tx = await contract.triggerDrawIfTargetReached({
  gasLimit: 500000
});

await tx.wait();
console.log("Draw triggered successfully!");
```

### الخطوة 6: فعّل الـ Upkeep

1. راجع كل الإعدادات
2. اضغط **"Register Upkeep"**
3. أكّد المعاملة في MetaMask (~0.1 LINK)

---

## 💰 التكلفة التقديرية:

| العنصر | التكلفة |
|--------|---------|
| إنشاء Upkeep | ~0.1 LINK (~$1.5) |
| المراقبة (كل دقيقة) | ~0.0001 LINK/فحص |
| الشهر الواحد | ~0.5 LINK (~$7-8) |
| **السنوي** | **~6 LINK (~$80-100)** |

### تمويل الـ Upkeep:
1. اذهب إلى صفحة الـ Upkeep
2. اضغط **"Add Funds"**
3. أضف 10 LINK (يكفي لـ ~20 شهراً بدون سحب)

---

## ✅ التحقق من العمل:

بعد الإعداد:
1. اذهب إلى: https://automation.chain.link/
2. سترى الـ Upkeep بحالة **"Active"**
3. عندما يصل الصندوق لـ $1M → سيُشغّل تلقائياً
4. سترى المعاملة على Polygonscan

---

## 📊 مراقبة الأداء:

- **Dashboard:** https://automation.chain.link/
- **عدد الفحوصات:** يظهر في الصفحة
- **آخر تنفيذ:** يظهر التاريخ
- **الرصيد المتبقي:** يظهر LINK المتبقي
