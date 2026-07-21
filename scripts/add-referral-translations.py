#!/usr/bin/env python3
"""Add referral section translations to all language files."""

import json
from pathlib import Path

MESSAGES_DIR = Path('/home/z/my-project/src/messages')

# Referral translations for each language
TRANSLATIONS = {
    "en": {
        # Top-level referral section (landing page)
        "referral": {
            "badge": "Zero-Cost Rewards",
            "title": "Earn While You Share",
            "subtitle": "Invite friends to 1DollarMillion and both of you get rewarded. You earn 1% of their prize if they win — at zero cost to the platform.",
            "benefit1Title": "+5 Free Active Days",
            "benefit1Desc": "When your friend deposits using your link, they get 5 extra days of active status — completely free.",
            "benefit1Value": "Free bonus for friend",
            "benefit2Title": "+5 Free Active Days For You",
            "benefit2Desc": "You also get 5 extra active days when your referred friend makes their first deposit. Mutual benefit.",
            "benefit2Value": "Free bonus for you",
            "benefit3Title": "1% of Their Prize",
            "benefit3Desc": "If your referred friend wins a $1M draw, you receive $9,953 — automatically, from the winner's payout. Zero cost to platform.",
            "benefit3Value": "$9,953 per win",
            "howItWorksTitle": "How Referrals Work",
            "step1Title": "Share Your Link",
            "step1Desc": "Get your unique referral link from the dashboard and share it with friends, family, or your community.",
            "step2Title": "Friend Deposits",
            "step2Desc": "When they deposit using your link, both of you get +5 free active days automatically.",
            "step3Title": "Earn When They Win",
            "step3Desc": "If your friend wins any draw, you instantly receive 1% of their prize ($9,953). No claim needed.",
            "rewardValue": "$9,953 per winning referral",
            "rewardDesc": "Paid automatically from the winner's prize — zero cost to the platform, zero cost to the winner's principal.",
            "ctaButton": "Get Your Referral Link",
            "ctaNote": "Connect your wallet in the dashboard to generate your unique referral link."
        },
        # Dashboard referral card
        "dashboard_referral": {
            "badge": "Referral Program",
            "title": "Your Referral Link",
            "subtitle": "Share this link. Earn 1% when your referrals win.",
            "connectPrompt": "Connect your wallet to get your referral link",
            "yourLink": "Your unique link",
            "copy": "Copy",
            "copied": "Copied!",
            "share": "Share",
            "invited": "Invited",
            "active": "Active",
            "earned": "Earned",
            "howItWorks": "How it works",
            "step1": "Share your link",
            "step2": "Friend deposits USDT",
            "step3": "You earn 1% if they win",
            "referredBy": "You were referred by"
        }
    },
    "ar": {
        "referral": {
            "badge": "مكافآت بلا تكلفة",
            "title": "اربح أثناء المشاركة",
            "subtitle": "ادعُ أصدقاءك إلى 1DollarMillion وكلاكما يحصل على مكافأة. أنت تكسب 1% من جائزتهم إذا فازوا — بدون أي تكلفة على المنصة.",
            "benefit1Title": "+5 أيام نشطة مجانية",
            "benefit1Desc": "عندما يودع صديقك باستخدام رابطك، يحصل على 5 أيام إضافية من الحالة النشطة — مجاناً تماماً.",
            "benefit1Value": "مكافأة مجانية لصديقك",
            "benefit2Title": "+5 أيام نشطة مجانية لك",
            "benefit2Desc": "أنت أيضاً تحصل على 5 أيام نشطة إضافية عندما يودع صديقك المُحال لأول مرة. منفعة متبادلة.",
            "benefit2Value": "مكافأة مجانية لك",
            "benefit3Title": "1% من جائزتهم",
            "benefit3Desc": "إذا فاز صديقك المُحال بسحب بمليون دولار، تحصل على $9,953 — تلقائياً، من جائزة الفائز. بدون تكلفة على المنصة.",
            "benefit3Value": "$9,953 لكل فوز",
            "howItWorksTitle": "كيف تعمل الإحالة",
            "step1Title": "شارك رابطك",
            "step1Desc": "احصل على رابط الإحالة الفريد من لوحة التحكم وشاركه مع الأصدقاء والعائلة أو مجتمعك.",
            "step2Title": "صديقك يودع",
            "step2Desc": "عندما يودع باستخدام رابطك، كلاكما يحصل على +5 أيام نشطة مجانية تلقائياً.",
            "step3Title": "اربح عندما يفوز",
            "step3Desc": "إذا فاز صديقك بأي سحب، تحصل فوراً على 1% من جائزته ($9,953). لا حاجة للمطالبة.",
            "rewardValue": "$9,953 لكل إحالة فائزة",
            "rewardDesc": "تُدفع تلقائياً من جائزة الفائز — بدون تكلفة على المنصة، بدون تكلفة على أصل الفائز.",
            "ctaButton": "احصل على رابط الإحالة",
            "ctaNote": "اربط محفظتك في لوحة التحكم لإنشاء رابط الإحالة الفريد."
        },
        "dashboard_referral": {
            "badge": "برنامج الإحالة",
            "title": "رابط الإحالة الخاص بك",
            "subtitle": "شارك هذا الرابط. اكسب 1% عندما يفوز من تحيلهم.",
            "connectPrompt": "اربط محفظتك للحصول على رابط الإحالة",
            "yourLink": "رابطك الفريد",
            "copy": "نسخ",
            "copied": "تم النسخ!",
            "share": "مشاركة",
            "invited": "تمت دعوتهم",
            "active": "نشط",
            "earned": "مُكتسب",
            "howItWorks": "كيف يعمل",
            "step1": "شارك رابطك",
            "step2": "صديقك يودع USDT",
            "step3": "تكسب 1% إذا فاز",
            "referredBy": "تمت إحالتك من قبل"
        }
    }
}

# For other languages, use English as fallback (still better than missing)
FALLBACK = TRANSLATIONS["en"]


def add_referral_translations(filepath: Path, lang: str):
    """Add referral translations to a language file."""
    with open(filepath, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    target = TRANSLATIONS.get(lang, FALLBACK)
    changes = 0
    
    # Add top-level referral section
    if "referral" not in data:
        data["referral"] = target["referral"]
        changes += 1
    
    # Add dashboard.referral section
    if "dashboard" in data and "referral" not in data["dashboard"]:
        data["dashboard"]["referral"] = target["dashboard_referral"]
        changes += 1
    
    if changes > 0:
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print(f'✅ {filepath.name}: added referral sections ({changes})')
    else:
        print(f'⏭️  {filepath.name}: already has referral')


def main():
    print("Adding referral translations to all language files...\n")
    for filepath in sorted(MESSAGES_DIR.glob('*.json')):
        lang = filepath.stem
        add_referral_translations(filepath, lang)
    print('\n✅ Done!')


if __name__ == '__main__':
    main()
