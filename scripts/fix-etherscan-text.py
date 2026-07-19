#!/usr/bin/env python3
"""Fix translation text: View on Etherscan → View on Polygonscan."""

import json
from pathlib import Path

MESSAGES_DIR = Path("/home/z/my-project/src/messages")

# Translations for "View on Polygonscan" in each language
VIEW_ON_POLYGONSCAN = {
    "en": "View on Polygonscan",
    "ar": "عرض على Polygonscan",
    "es": "Ver en Polygonscan",
    "fr": "Voir sur Polygonscan",
    "de": "Auf Polygonscan ansehen",
    "hi": "Polygonscan पर देखें",
    "ru": "Посмотреть на Polygonscan",
    "pt": "Ver no Polygonscan",
    "zh": "在 Polygonscan 上查看",
    "fa": "نمایش در Polygonscan",
    "tr": "Polygonscan'da görüntüle",
    "vi": "Xem trên Polygonscan",
    "id": "Lihat di Polygonscan",
}

# Also fix the transparency page text
TRANSPARENCY_VIEW_ON_ETHERSCAN = {
    "en": "View on Polygonscan",
    "ar": "عرض على Polygonscan",
    "es": "Ver en Polygonscan",
    "fr": "Voir sur Polygonscan",
    "de": "Auf Polygonscan ansehen",
    "hi": "Polygonscan पर देखें",
    "ru": "Посмотреть на Polygonscan",
    "pt": "Ver no Polygonscan",
    "zh": "在 Polygonscan 上查看",
    "fa": "نمایش در Polygonscan",
    "tr": "Polygonscan'da görüntüle",
    "vi": "Xem trên Polygonscan",
    "id": "Lihat di Polygonscan",
}


def fix_translations(filepath: Path, lang: str):
    """Fix all 'Etherscan' references in a language file."""
    with open(filepath, 'r', encoding='utf-8') as f:
        data = json.load(f)

    changes = 0
    polygonscan_text = VIEW_ON_POLYGONSCAN.get(lang, VIEW_ON_POLYGONSCAN["en"])

    # 1. Fix dashboard.pool.viewOnEtherscan
    if "dashboard" in data and "pool" in data["dashboard"]:
        if "viewOnEtherscan" in data["dashboard"]["pool"]:
            data["dashboard"]["pool"]["viewOnEtherscan"] = polygonscan_text
            changes += 1

    # 2. Fix dashboard.solvency.viewOnEtherscan
    if "dashboard" in data and "solvency" in data["dashboard"]:
        if "viewOnEtherscan" in data["dashboard"]["solvency"]:
            data["dashboard"]["solvency"]["viewOnEtherscan"] = polygonscan_text
            changes += 1

    # 3. Fix transparency.viewOnEtherscan (if exists)
    if "transparency" in data and "viewOnEtherscan" in data["transparency"]:
        data["transparency"]["viewOnEtherscan"] = polygonscan_text
        changes += 1

    # 4. Fix footer.developerLinks.contract (Etherscan → Polygonscan)
    if "footer" in data and "developerLinks" in data["footer"]:
        if "contract" in data["footer"]["developerLinks"]:
            old = data["footer"]["developerLinks"]["contract"]
            if "Etherscan" in old or "etherscan" in old:
                data["footer"]["developerLinks"]["contract"] = old.replace(
                    "Etherscan", "Polygonscan"
                ).replace("etherscan", "Polygonscan")
                changes += 1

    if changes > 0:
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print(f"✅ {filepath.name}: {changes} fixes")
    else:
        print(f"⏭️  {filepath.name}: no changes needed")


def main():
    print("Fixing translation texts (Etherscan → Polygonscan)...\n")
    for filepath in sorted(MESSAGES_DIR.glob("*.json")):
        lang = filepath.stem
        fix_translations(filepath, lang)
    print("\n✅ Done!")


if __name__ == "__main__":
    main()
