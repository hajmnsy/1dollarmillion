#!/usr/bin/env python3
"""Update network translations: Sepolia → Polygon in all language files."""

import json
import re
from pathlib import Path

MESSAGES_DIR = Path('/home/z/my-project/src/messages')

# New translations for each language
TRANSLATIONS = {
    "en": {
        "wrongChainTitle": "Wrong Network",
        "wrongChainDesc": "You're connected to {connectedChain}. This app runs on Polygon Mainnet.",
        "switchButton": "Switch to Polygon",
        "switching": "Switching network...",
        "alreadyConnected": "Connected to Polygon",
    },
    "ar": {
        "wrongChainTitle": "شبكة خاطئة",
        "wrongChainDesc": "أنت متصل بـ {connectedChain}. هذا التطبيق يعمل على شبكة Polygon.",
        "switchButton": "التبديل إلى Polygon",
        "switching": "جارٍ تبديل الشبكة...",
        "alreadyConnected": "متصل بـ Polygon",
    },
    "es": {
        "wrongChainTitle": "Red incorrecta",
        "wrongChainDesc": "Estás conectado a {connectedChain}. Esta aplicación funciona en Polygon Mainnet.",
        "switchButton": "Cambiar a Polygon",
        "switching": "Cambiando de red...",
        "alreadyConnected": "Conectado a Polygon",
    },
    "fr": {
        "wrongChainTitle": "Mauvais réseau",
        "wrongChainDesc": "Vous êtes connecté à {connectedChain}. Cette application fonctionne sur Polygon Mainnet.",
        "switchButton": "Passer à Polygon",
        "switching": "Changement de réseau...",
        "alreadyConnected": "Connecté à Polygon",
    },
    "de": {
        "wrongChainTitle": "Falsches Netzwerk",
        "wrongChainDesc": "Sie sind mit {connectedChain} verbunden. Diese App läuft auf Polygon Mainnet.",
        "switchButton": "Zu Polygon wechseln",
        "switching": "Netzwerk wird gewechselt...",
        "alreadyConnected": "Mit Polygon verbunden",
    },
    "hi": {
        "wrongChainTitle": "गलत नेटवर्क",
        "wrongChainDesc": "आप {connectedChain} से जुड़े हैं। यह ऐप Polygon Mainnet पर चलता है।",
        "switchButton": "Polygon पर स्विच करें",
        "switching": "नेटवर्क स्विच हो रहा है...",
        "alreadyConnected": "Polygon से जुड़ा",
    },
    "ru": {
        "wrongChainTitle": "Неверная сеть",
        "wrongChainDesc": "Вы подключены к {connectedChain}. Это приложение работает в Polygon Mainnet.",
        "switchButton": "Переключиться на Polygon",
        "switching": "Переключение сети...",
        "alreadyConnected": "Подключено к Polygon",
    },
    "pt": {
        "wrongChainTitle": "Rede Errada",
        "wrongChainDesc": "Você está conectado à {connectedChain}. Este aplicativo funciona na Polygon Mainnet.",
        "switchButton": "Mudar para Polygon",
        "switching": "Mudando de rede...",
        "alreadyConnected": "Conectado à Polygon",
    },
    "zh": {
        "wrongChainTitle": "错误的网络",
        "wrongChainDesc": "您连接到 {connectedChain}。此应用在 Polygon 主网上运行。",
        "switchButton": "切换到 Polygon",
        "switching": "正在切换网络...",
        "alreadyConnected": "已连接到 Polygon",
    },
    "fa": {
        "wrongChainTitle": "شبکه اشتباه",
        "wrongChainDesc": "شما به {connectedChain} متصل هستید. این برنامه روی Polygon Mainnet اجرا می‌شود.",
        "switchButton": "تغییر به Polygon",
        "switching": "در حال تغییر شبکه...",
        "alreadyConnected": "متصل به Polygon",
    },
    "tr": {
        "wrongChainTitle": "Yanlış Ağ",
        "wrongChainDesc": "{connectedChain} ağına bağlısınız. Bu uygulama Polygon Mainnet'te çalışır.",
        "switchButton": "Polygon'a geç",
        "switching": "Ağ değiştiriliyor...",
        "alreadyConnected": "Polygon'a bağlı",
    },
    "vi": {
        "wrongChainTitle": "Mạng sai",
        "wrongChainDesc": "Bạn đang kết nối với {connectedChain}. Ứng dụng này chạy trên Polygon Mainnet.",
        "switchButton": "Chuyển sang Polygon",
        "switching": "Đang chuyển mạng...",
        "alreadyConnected": "Đã kết nối với Polygon",
    },
    "id": {
        "wrongChainTitle": "Jaringan Salah",
        "wrongChainDesc": "Anda terhubung ke {connectedChain}. Aplikasi ini berjalan di Polygon Mainnet.",
        "switchButton": "Beralih ke Polygon",
        "switching": "Mengalihkan jaringan...",
        "alreadyConnected": "Terhubung ke Polygon",
    },
}

FALLBACK = TRANSLATIONS["en"]


def update_network_translations(filepath: Path, lang: str):
    """Update network section in a language file."""
    with open(filepath, 'r', encoding='utf-8') as f:
        data = json.load(f)

    target = TRANSLATIONS.get(lang, FALLBACK)
    changes = 0

    if "dashboard" in data and "network" in data["dashboard"]:
        network = data["dashboard"]["network"]
        for key, value in target.items():
            if key in network and network[key] != value:
                network[key] = value
                changes += 1
            elif key not in network:
                network[key] = value
                changes += 1

    if changes > 0:
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print(f'✅ {filepath.name}: {changes} network keys updated')
    else:
        print(f'⏭️  {filepath.name}: no changes needed')


def main():
    print("Updating network translations (Sepolia → Polygon)...\n")
    for filepath in sorted(MESSAGES_DIR.glob('*.json')):
        lang = filepath.stem
        update_network_translations(filepath, lang)
    print('\n✅ Done!')


if __name__ == '__main__':
    main()
