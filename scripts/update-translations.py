#!/usr/bin/env python3
"""Update all language files with missing translation keys."""

import json
import os
from pathlib import Path

MESSAGES_DIR = Path("/home/z/my-project/src/messages")

# Translations for each language
# Keys to add:
# 1. dashboard.stats.verifyOnChainlink
# 2. dashboard.pool.viewOnEtherscan
# 3. dashboard.yield.viewOnAave

TRANSLATIONS = {
    "ar": {
        "verifyOnChainlink": "تحقق على Chainlink",
        "viewOnEtherscan_pool": "عرض على Polygonscan",
        "viewOnAave_yield": "عرض على Aave",
    },
    "de": {
        "verifyOnChainlink": "Auf Chainlink verifizieren",
        "viewOnEtherscan_pool": "Auf Polygonscan ansehen",
        "viewOnAave_yield": "Auf Aave ansehen",
    },
    "es": {
        "verifyOnChainlink": "Verificar en Chainlink",
        "viewOnEtherscan_pool": "Ver en Polygonscan",
        "viewOnAave_yield": "Ver en Aave",
    },
    "fa": {
        "verifyOnChainlink": "تأیید در Chainlink",
        "viewOnEtherscan_pool": "نمایش در Polygonscan",
        "viewOnAave_yield": "نمایش در Aave",
    },
    "fr": {
        "verifyOnChainlink": "Vérifier sur Chainlink",
        "viewOnEtherscan_pool": "Voir sur Polygonscan",
        "viewOnAave_yield": "Voir sur Aave",
    },
    "hi": {
        "verifyOnChainlink": "Chainlink पर सत्यापित करें",
        "viewOnEtherscan_pool": "Polygonscan पर देखें",
        "viewOnAave_yield": "Aave पर देखें",
    },
    "id": {
        "verifyOnChainlink": "Verifikasi di Chainlink",
        "viewOnEtherscan_pool": "Lihat di Polygonscan",
        "viewOnAave_yield": "Lihat di Aave",
    },
    "pt": {
        "verifyOnChainlink": "Verificar na Chainlink",
        "viewOnEtherscan_pool": "Ver no Polygonscan",
        "viewOnAave_yield": "Ver no Aave",
    },
    "ru": {
        "verifyOnChainlink": "Проверить на Chainlink",
        "viewOnEtherscan_pool": "Посмотреть на Polygonscan",
        "viewOnAave_yield": "Посмотреть на Aave",
    },
    "tr": {
        "verifyOnChainlink": "Chainlink'te doğrula",
        "viewOnEtherscan_pool": "Polygonscan'da görüntüle",
        "viewOnAave_yield": "Aave'de görüntüle",
    },
    "vi": {
        "verifyOnChainlink": "Xác minh trên Chainlink",
        "viewOnEtherscan_pool": "Xem trên Polygonscan",
        "viewOnAave_yield": "Xem trên Aave",
    },
    "zh": {
        "verifyOnChainlink": "在 Chainlink 上验证",
        "viewOnEtherscan_pool": "在 Polygonscan 上查看",
        "viewOnAave_yield": "在 Aave 上查看",
    },
    "en": {
        "verifyOnChainlink": "Verify on Chainlink",
        "viewOnEtherscan_pool": "View on Polygonscan",
        "viewOnAave_yield": "View on Aave",
    },
}

def update_file(filepath: Path, lang: str):
    """Update a single language file with missing keys."""
    with open(filepath, 'r', encoding='utf-8') as f:
        data = json.load(f)

    translations = TRANSLATIONS.get(lang, TRANSLATIONS["en"])

    changes = 0

    # 1. Add verifyOnChainlink to dashboard.stats
    if "dashboard" in data and "stats" in data["dashboard"]:
        if "verifyOnChainlink" not in data["dashboard"]["stats"]:
            data["dashboard"]["stats"]["verifyOnChainlink"] = translations["verifyOnChainlink"]
            changes += 1

    # 2. Add viewOnEtherscan to dashboard.pool
    if "dashboard" in data and "pool" in data["dashboard"]:
        if "viewOnEtherscan" not in data["dashboard"]["pool"]:
            data["dashboard"]["pool"]["viewOnEtherscan"] = translations["viewOnEtherscan_pool"]
            changes += 1

    # 3. Add viewOnAave to dashboard.yield (if not already there or empty)
    if "dashboard" in data and "yield" in data["dashboard"]:
        current = data["dashboard"]["yield"].get("viewOnAave", "")
        if not current:
            data["dashboard"]["yield"]["viewOnAave"] = translations["viewOnAave_yield"]
            changes += 1

    # Write back if changes were made
    if changes > 0:
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print(f"✅ {filepath.name}: {changes} keys added")
    else:
        print(f"⏭️  {filepath.name}: no changes needed")


def main():
    print("Updating language files...\n")
    for filepath in sorted(MESSAGES_DIR.glob("*.json")):
        lang = filepath.stem
        if lang == "en":
            print(f"⏭️  {filepath.name}: skipping (already updated)")
            continue
        update_file(filepath, lang)

    print("\n✅ All language files updated!")


if __name__ == "__main__":
    main()
