# 🚀 دليل نشر عقد V4 على Polygon (بدون Aave - حلال)

## 📋 نظرة عامة

عقد V4 هو الإصدار المتوافق مع الشريعة الإسلامية:
- ❌ لا Aave (لا ربا)
- ❌ لا سحوبات مكافآت (كانت تموّلها Aave)
- ✅ فقط الخصومات اليومية + السحب العادي
- ✅ رأس المال محمي 100%

---

## 🔧 المتطلبات:

- محفظة MetaMask على Polygon
- ~0.1 POL للـ gas
- VRF Subscription مموّل بـ LINK (موجود من قبل)

---

## 📦 نشر العقد عبر Remix:

### الخطوة 1: حمّل العقد

**الملف:** `/home/z/my-project/download/HybridRoscaLotteryV4.sol`

### الخطوة 2: افتح Remix

https://remix.ethereum.org

### الخطوة 3: ارفع الكود

1. أنشئ ملف `HybridRoscaLotteryV4.sol`
2. الصق محتوى العقد
3. اضغط **Solidity Compiler** 📦
4. اضبط: `0.8.20` + `Enable optimization` + `viaIR`
5. اضغط **Compile**

### الخطوة 4: انشر العقد

1. اضغط **Deploy & Run** 🚀
2. Environment: **Injected Provider - MetaMask**
3. الشبكة: **Polygon Mainnet**
4. املأ Constructor (4 معاملات فقط!):

```
_usdt:              0xc2132D05D31c914a87C6611C10748AEb04B58e8F
_vrfCoordinator:    0xAE1472F8Ad2564f55505f927Be9323D51f8A2370
_vrfKeyHash:        0xd729dc84e21ae07f64634c406d0b7b2e0a4877fb0164ab80e44ed6b0b5bcb3a4
_vrfSubscriptionId: 5138795994368458865858465733297478458437338427540524283346653360622563975716
```

5. اضغط **Deploy** → أكّد في MetaMask
6. **انسخ عنوان العقد الجديد!**

### الخطوة 5: أضف العقد كـ Consumer

1. اذهب إلى: https://vrf.chain.link/
2. افتح الـ Subscription
3. **Consumers** → **Add Consumer**
4. الصق عنوان V4 الجديد
5. أكّد في MetaMask

### الخطوة 6: حدّث الـ Frontend

في ملف `src/lib/contract/config.ts`:
- استبدل `LOTTERY_CONTRACT_ADDRESS` بالعنوان الجديد
- استبدل الـ ABI بـ ABI الجديد (V4)

---

## ✅ الفروقات عن V3:

| الميزة | V3 | V4 |
|--------|----|----|
| المعاملات في Constructor | 6 | **4** (لا Aave) |
| حجم العقد | 18,108 bytes | **11,198 bytes** (أصغر!) |
| استثمار Aave | ✅ | ❌ (حلال) |
| سحوبات المكافآت | ✅ | ❌ |
| التوافق الشرعي | ❌ ربا | ✅ حلال |
