#!/usr/bin/env python3
"""Add missing legalPages.docs and legalPages.audit sections to all language files."""

import json
from pathlib import Path

MESSAGES_DIR = Path("/home/z/my-project/src/messages")

# Translations for docs and audit pages
DOCS_AUDIT = {
    "en": {
        "docs": {
            "title": "Documentation",
            "subtitle": "The complete technical documentation for the 1DollarMillion protocol.",
            "section1Title": "1. Protocol Overview",
            "section1Body": "1DollarMillion is a no-loss lottery on Polygon combining ROSCA with DeFi yield from Aave V3. The prize pool grows automatically from $1/day deductions. When it reaches $1,000,000, a winner is selected via Chainlink VRF v2.5.",
            "section2Title": "2. Tokenomics",
            "section2Body": "The contract deducts 1 USDT per day from each active user. These deductions feed the prize pool. Idle deposits are invested in Aave V3 to generate yield that funds bonus draws.",
            "section3Title": "3. Prize Distribution",
            "section3Body": "When a draw completes: $995,350 to winner (or $985,397 with referrer), $3,650 locked for 10 years, $1,000 operational fee, $9,953 to referrer (if applicable). No hidden fees.",
            "section4Title": "4. Contract Addresses (Polygon Mainnet)",
            "section4Body": "Lottery V3: 0xcf8e2713FCD5653B4Bf9d440CF43c5F05524365F. USDT: 0xc2132D05D31c914a87C6611C10748AEb04B58e8F. Verify full source code on Polygonscan.",
            "section5Title": "5. Frontend Integration",
            "section5Body": "Frontend built with Next.js 16 + wagmi v2 + viem. Uses pruned ABI from lib/contract/config.ts. All read calls target Polygon Mainnet (Chain ID: 137)."
        },
        "audit": {
            "title": "Audit Report",
            "subtitle": "Security audit status for the 1DollarMillion protocol.",
            "section1Title": "1. Audit Status",
            "section1Body": "The smart contract is ready for third-party audit. Uses OpenZeppelin battle-tested libraries and follows Checks-Effects-Interactions pattern. Formal audit by external firm will be conducted before mass launch.",
            "section2Title": "2. Security Features",
            "section2Body": "Contract includes: ReentrancyGuard (anti-reentrancy), SafeERC20 (safe transfers), Ownable (admin control). Solvency fix-up runs after each draw to maintain solvencyGap >= yield invariant.",
            "section3Title": "3. Foundry Tests",
            "section3Body": "40+ Foundry tests covering: normal flow, yield flow, edge cases (zero-buffer withdrawal, dual-draw race), and invariants (solvency). All tests pass.",
            "section4Title": "4. Polygonscan Verification",
            "section4Body": "Contract source code is verified on Polygonscan. Anyone can review the logic and verify that prize distribution is hardcoded and cannot be changed.",
            "section5Title": "5. Bug Bounty",
            "section5Body": "A bug bounty program will be launched after the formal audit. Follow the GitHub page for updates."
        }
    },
    "ar": {
        "docs": {
            "title": "التوثيق",
            "subtitle": "التوثيق التقني الكامل لبروتوكول 1DollarMillion.",
            "section1Title": "1. نظرة عامة على البروتوكول",
            "section1Body": "1DollarMillion يانصيب بدون خسارة على Polygon يجمع بين ROSCA وعائد DeFi من Aave V3. صندوق الجائزة ينمو تلقائياً من خصومات $1/يوم. عند وصوله إلى $1,000,000، يتم اختيار الفائز عبر Chainlink VRF v2.5.",
            "section2Title": "2. التوكنوميكس",
            "section2Body": "العقد يخصم 1 USDT يومياً من كل مستخدم نشط. هذه الخصومات تغذي صندوق الجائزة. الودائع الخاملة تستثمر في Aave V3 لتوليد عائد يمول سحوبات المكافآت.",
            "section3Title": "3. توزيع الجائزة",
            "section3Body": "عند اكتمال السحب: $995,350 للفائز (أو $985,397 مع مُحيل)، $3,650 محجوزة لـ 10 سنوات، $1,000 رسوم تشغيل، $9,953 للمُحيل (إن وجد). لا توجد رسوم خفية.",
            "section4Title": "4. عناوين العقود (Polygon Mainnet)",
            "section4Body": "Lottery V3: 0xcf8e2713FCD5653B4Bf9d440CF43c5F05524365F. USDT: 0xc2132D05D31c914a87C6611C10748AEb04B58e8F. تحقق من الكود الكامل على Polygonscan.",
            "section5Title": "5. تكامل الواجهة الأمامية",
            "section5Body": "الواجهة مبنية بـ Next.js 16 + wagmi v2 + viem. تستخدم ABI مُقلّم من lib/contract/config.ts. كل استدعاءات القراءة تستهدف Polygon Mainnet (Chain ID: 137)."
        },
        "audit": {
            "title": "تقرير التدقيق",
            "subtitle": "حالة التدقيق الأمني لبروتوكول 1DollarMillion.",
            "section1Title": "1. حالة التدقيق",
            "section1Body": "العقد الذكي جاهز للتدقيق الخارجي. يستخدم مكتبات OpenZeppelin المختبرة ويتبع نمط Checks-Effects-Interactions. سيتم تدقيق رسمي من شركة خارجية قبل الإطلاق الجماهيري.",
            "section2Title": "2. الميزات الأمنية",
            "section2Body": "العقد يتضمن: ReentrancyGuard (ضد إعادة الدخول)، SafeERC20 (تحويلات آمنة)، Ownable (تحكم الإدارة). إصلاح الملاءة يعمل بعد كل سحب للحفاظ على solvencyGap >= yield.",
            "section3Title": "3. اختبارات Foundry",
            "section3Body": "أكثر من 40 اختبار Foundry تغطي: التدفق العادي، تدفق العائد، الحالات الحدية (سحب بدون buffer، سباق السحب المزدوج)، والثوابت (الملاءة). كل الاختبارات تنجح.",
            "section4Title": "4. التحقق من Polygonscan",
            "section4Body": "كود المصدر للعقد مُتحقق على Polygonscan. يمكن لأي شخص مراجعة المنطق والتحقق من أن توزيع الجائزة مُشفّر ولا يمكن تغييره.",
            "section5Title": "5. مكافأة الأخطاء",
            "section5Body": "سيتم إطلاق برنامج مكافأة الأخطاء بعد التدقيق الرسمي. تابع صفحة GitHub للتحديثات."
        }
    }
}

# For other languages, use English as fallback (better than missing)
FALLBACK = DOCS_AUDIT["en"]

def add_docs_audit(filepath: Path, lang: str):
    """Add docs and audit sections to a language file."""
    with open(filepath, 'r', encoding='utf-8') as f:
        data = json.load(f)

    if "legalPages" not in data:
        data["legalPages"] = {}

    changes = 0
    target = DOCS_AUDIT.get(lang, FALLBACK)

    if "docs" not in data["legalPages"]:
        data["legalPages"]["docs"] = target["docs"]
        changes += 1
    if "audit" not in data["legalPages"]:
        data["legalPages"]["audit"] = target["audit"]
        changes += 1

    if changes > 0:
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print(f"✅ {filepath.name}: added {changes} sections")
    else:
        print(f"⏭️  {filepath.name}: already has docs/audit")


def main():
    print("Adding docs/audit sections to language files...\n")
    for filepath in sorted(MESSAGES_DIR.glob("*.json")):
        lang = filepath.stem
        add_docs_audit(filepath, lang)
    print("\n✅ Done!")


if __name__ == "__main__":
    main()
