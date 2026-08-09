<div align="center">

# 💰 1DollarMillion

### Deposit USDT. Win $1,000,000. Never lose your principal.

The world's first hybrid ROSCA + No-Loss Lottery, powered by DeFi yield.

[![Solidity](https://img.shields.io/badge/Solidity-^0.8.20-363636?style=for-the-badge&logo=solidity)](https://soliditylang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](https://opensource.org/licenses/MIT)

</div>

---

## 🌟 Overview

**1DollarMillion** is a decentralized no-loss lottery protocol built on Ethereum. Users deposit USDT, and the contract logically deducts $1/day to keep them eligible for a $1,000,000 prize draw. The winner is selected via **Chainlink VRF** (provably fair randomness). Idle deposits earn yield on **Aave V3**, funding additional **Bonus Draws** at no extra cost to users.

### Key Innovation
Unlike traditional lotteries where you lose your money, **1DollarMillion** never risks your principal:
- Your deposit stays in the contract, backed 1:1
- Only the $1/day deduction feeds the prize pool
- Aave V3 yield on idle deposits funds bonus draws
- Withdraw anytime — no lock-up

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    1DollarMillion Protocol                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │   User Deposit │   │  Daily $1    │    │  Prize Pool  │  │
│  │   (USDT)      │───▶│  Deduction   │───▶│  ($1M target)│  │
│  └──────────────┘    └──────────────┘    └──────┬───────┘  │
│         │                                         │          │
│         ▼                                         ▼          │
│  ┌──────────────┐                        ┌──────────────┐   │
│  │  Aave V3     │──── Yield ────────────▶│  Bonus Draws │   │
│  │  (aUSDT)     │                        │  ($1M yield) │   │
│  └──────────────┘                        └──────┬───────┘   │
│         │                                        │           │
│         ▼                                        ▼           │
│  ┌──────────────┐                        ┌──────────────┐   │
│  │  Principal   │                        │  Chainlink   │   │
│  │  Protected   │                        │  VRF v2      │   │
│  │  (1:1 backed)│                        │  (Randomness)│   │
│  └──────────────┘                        └──────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Smart Contract Stack
| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Smart Contract** | Solidity ^0.8.20 | Core lottery logic (V3 with referral program) |
| **Security** | OpenZeppelin v5 | ReentrancyGuard, SafeERC20, Ownable |
| **Randomness** | Chainlink VRF v2 | Provably fair winner selection |
| **Yield** | Aave V3 | Interest on idle USDT deposits |
| **Token** | USDT (6 decimals) | Stablecoin for all transactions |
| **Referral** | On-chain mapping | +5 bonus days + 1% winner reward |

### Frontend Stack
| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Framework** | Next.js 16 (App Router) | SSR/SSG + React Server Components |
| **Styling** | Tailwind CSS 4 + shadcn/ui | Modern dark theme UI |
| **Web3** | wagmi v2 + viem | Ethereum interaction |
| **Wallets** | WalletConnect v2 | 300+ wallet support (MetaMask, Trust, Coinbase, Phantom) |
| **i18n** | next-intl | 11 languages (English, Arabic, Spanish, French, Chinese, Hindi, Russian, Portuguese, Turkish, Persian, German) |
| **State** | TanStack Query | Server state caching |
| **Animation** | Framer Motion | UI transitions |

---

## 🎯 How It Works

### Regular Draw
1. **Deposit** USDT (minimum $1, recommended $30 for gas efficiency)
2. **Stay Active** — $1/day is deducted from your balance to feed the prize pool
3. **Win** — When the pool reaches $1,000,000, Chainlink VRF selects a random winner
4. **Prize Distribution** (standard):
   - **$995,350** → Winner's wallet (99.535%)
   - **$3,650** → Locked in contract under winner's name (10-year advance for daily deductions)
   - **$1,000** → Platform operational fee (0.100%)
5. **Prize Distribution** (if winner was referred):
   - **$985,397** → Winner's wallet (98.540%)
   - **$9,953** → Referrer's wallet (0.995% referral reward)
   - **$3,650** → Locked in contract (10-year advance)
   - **$1,000** → Platform operational fee (0.100%)

### Bonus Draw (Powered by Aave V3)
- Idle deposits are supplied to Aave V3 to earn yield
- When accumulated yield reaches $1,000,000, a **Bonus Draw** fires automatically
- Same prize distribution, same Chainlink VRF fairness
- Your principal is never at risk — only the interest is paid out

### Referral Program (V3)
- Share your referral link: `1dollarmillion.com/?ref=0xYourWallet`
- **Referred user** gets +5 bonus active days on first deposit
- **Referrer** gets +5 bonus active days when referred user deposits
- **Referrer** earns 1% of prize ($9,953) if referred user wins a draw
- Anti-abuse: self-referral blocked, one-time bonus per address
- Zero cost to platform — referral rewards come from winner's payout

### Solvency Guarantee
The contract maintains a strict invariant: `totalAssets ≥ totalPrincipal`. This is enforced by:
- Separating principal from yield in accounting
- A post-draw solvency fix-up block
- Real-time `accountingSummary()` function for public verification

---

## 🌍 Supported Languages (11)

| Flag | Language | Code | Direction |
|------|----------|------|-----------|
| 🇬🇧 | English | `en` | LTR |
| 🇸🇦 | العربية | `ar` | RTL |
| 🇪🇸 | Español | `es` | LTR |
| 🇫🇷 | Français | `fr` | LTR |
| 🇨🇳 | 中文 | `zh` | LTR |
| 🇮🇳 | हिन्दी | `hi` | LTR |
| 🇷🇺 | Русский | `ru` | LTR |
| 🇵🇹 | Português | `pt` | LTR |
| 🇹🇷 | Türkçe | `tr` | LTR |
| 🇮🇷 | فارسی | `fa` | RTL |
| 🇩🇪 | Deutsch | `de` | LTR |

---

## 🚀 Quick Start

### Prerequisites
- [Node.js](https://nodejs.org/) 18+ or [Bun](https://bun.sh/)
- [Foundry](https://getfoundry.sh/) (for smart contract development)
- MetaMask or any Web3 wallet

### Frontend Setup
```bash
# Clone the repository
git clone https://github.com/yourusername/1dollarmillion.git
cd 1dollarmillion

# Install dependencies
bun install  # or npm install

# Set environment variables
cp .env.example .env
# Edit .env and set NEXT_PUBLIC_WC_PROJECT_ID

# Start development server
bun run dev

# Build for production
NODE_OPTIONS="--max-old-space-size=4096" bun run build
bun run start
```

### Smart Contract Deployment
```bash
cd foundry

# Install dependencies
forge install OpenZeppelin/openzeppelin-contracts
forge install smartcontractkit/chainlink-brownie-contracts

# Build
forge build

# Deploy to Sepolia
forge script script/DeploySepolia.s.sol \
  --rpc-url https://ethereum-sepolia-rpc.publicnode.com \
  --broadcast \
  --private-key YOUR_PRIVATE_KEY

# Run tests
forge test -vvv
```

### Environment Variables
```env
# WalletConnect Project ID (get FREE at https://cloud.walletconnect.com)
NEXT_PUBLIC_WC_PROJECT_ID=your_project_id

# Database (for Prisma)
DATABASE_URL=file:./db/custom.db
```

---

## 📁 Project Structure

```
1dollarmillion/
├── src/                          # Next.js frontend
│   ├── app/                      # App Router pages
│   │   ├── [locale]/             # i18n locale routing (11 languages)
│   │   │   ├── page.tsx          # Landing page
│   │   │   ├── dashboard/        # User dashboard
│   │   │   ├── faq/              # FAQ page
│   │   │   ├── terms/            # Terms of Service
│   │   │   ├── privacy/          # Privacy Policy
│   │   │   ├── risk/             # Risk Disclosure
│   │   │   ├── transparency/     # Transparency dashboard
│   │   │   ├── winners/          # Winner hall of fame
│   │   │   ├── docs/             # Documentation
│   │   │   ├── audit/            # Audit report
│   │   │   └── github/           # GitHub info
│   │   └── layout.tsx            # Root layout
│   ├── components/               # React components
│   │   ├── landing/              # Landing page sections
│   │   ├── dashboard/            # Dashboard cards & modals
│   │   └── web3/                 # Wallet connection
│   ├── hooks/                    # Custom React hooks
│   │   ├── useLottery.ts         # Contract read hooks
│   │   ├── useDeposit.ts         # Deposit flow (approve + deposit with referral)
│   │   ├── useWithdraw.ts        # Withdraw flow
│   │   ├── useNetworkGuard.ts    # Chain mismatch detection
│   │   └── useActivityFeed.ts    # Activity history
│   ├── lib/contract/             # ABI + contract config (V3)
│   ├── providers/                # Wagmi + React Query
│   ├── i18n/                     # next-intl routing (11 languages)
│   └── messages/                 # Translation files (11 languages)
├── download/                     # Smart contracts
│   ├── HybridRoscaLotteryV3.sol  # Main contract (V3 with referral)
│   ├── HybridRoscaLotteryV2.sol  # Previous version (V2.1.1)
│   └── HybridRoscaLottery.t.sol  # Foundry test suite (40+ tests)
├── public/                       # Static assets
│   ├── logo-main.png             # Brand logo (transparent bg)
│   └── wallet-*.png              # Wallet brand icons (5 wallets)
├── README.md
└── package.json
```

---

## 🔒 Security

### Smart Contract Security
- **OpenZeppelin v5**: ReentrancyGuard, SafeERC20, Ownable
- **Checks-Effects-Interactions** pattern throughout
- **Solvency invariant**: `totalAssets ≥ totalPrincipal` enforced post-draw
- **Lazy deduction model**: Gas-efficient daily $1 deduction
- **O(1) user removal**: Swap-and-pop for active users array

### Frontend Security
- **SSR-safe Wagmi**: `next/dynamic` with `ssr: false` for wallet components
- **Chain enforcement**: All contract reads pinned to Sepolia chain ID
- **Network guard**: Automatic chain switch prompt on wrong network
- **No private keys** in frontend code

### Tested Scenarios (40+ Foundry tests)
- ✅ Normal deposit → deduction → draw → payout flow
- ✅ Yield accrual → bonus draw → payout (principal untouched)
- ✅ Solvency invariant maintained through all operations
- ✅ Edge cases: zero-buffer withdrawal, dual-draw race, user depletion
- ✅ Access control: winner cannot re-enter, owner cannot drain
- ✅ Referral: bonus days awarded, 1% payout on win, self-referral blocked

---

## 📊 Contract Addresses (Sepolia Testnet)

| Contract | Address |
|----------|---------|
| **HybridRoscaLotteryV3** (with referral) | `0x46BF233AF0788f7d198efc5B1e118C2D273e4471` |
| **MockUSDT** | `0xC8A1b8558001Db2cc8042e6a98Bae25bD985B9d3` |
| **MockAUSDT** | `0x286Fa19d912D691aA7CA9A2443Ff4cC11fC1Ba8e` |
| **MockAavePool** | `0x02e7B6861d09d9683C4957B20729e2445E67464a` |
| **MockVRFCoordinator** | `0xa02e257db0172A064e1D110b14684e07142c554A` |

[View V3 on Etherscan →](https://sepolia.etherscan.io/address/0x46BF233AF0788f7d198efc5B1e118C2D273e4471)

---

## 🎨 Features

### User Features
- 💰 **No-loss lottery** — Principal always protected
- ⚡ **Instant deposits/withdrawals** — No lock-up period
- 🔍 **Full transparency** — All data verifiable on-chain
- 🌍 **11 languages** — English, Arabic, Spanish, French, Chinese, Hindi, Russian, Portuguese, Turkish, Persian, German
- 📱 **Mobile-first** — Responsive design with WalletConnect QR
- 🎯 **Gas optimization UX** — 5-layer gas efficiency guidance
- 🎁 **Referral program** — +5 bonus days + 1% winner reward
- 🔗 **5 wallets** — MetaMask, Trust Wallet, Coinbase, Phantom, WalletConnect (300+)

### Dashboard Features
- 📊 **Live pool progress** — Real-time pool growth visualization
- 💵 **Yield tracker** — Aave V3 yield accrual monitor
- 🛡️ **Solvency check** — On-chain solvency verification
- 📈 **Odds calculator** — Real-time winning probability
- 📋 **Activity feed** — Transaction history
- 🔄 **Deposit/Withdraw modals** — Two-step approval wizard
- 🎁 **Referral card** — Share link, copy button, stats, QR sharing

### Technical Features
- 🌐 **SSR + SSG** — Pre-rendered pages for SEO + performance
- 🔄 **Real-time updates** — Polling + event subscriptions
- 📱 **PWA-ready** — Installable on mobile devices
- 🎭 **Dark theme** — Modern, trust-building aesthetic
- ⚡ **Production build** — Optimized for low memory footprint
- 🔀 **Network guard** — Automatic chain switch prompt
- 🌐 **RTL support** — Arabic and Persian with proper layout

---

## 🛣️ Roadmap

- [x] Smart contract V3 (with Aave yield + solvency fix-up + referral program)
- [x] Foundry test suite (40+ tests)
- [x] Next.js frontend with 11 languages
- [x] Wallet support: MetaMask, Trust Wallet, WalletConnect, Coinbase, Phantom
- [x] Sepolia testnet deployment (V3)
- [x] Referral program (on-chain + frontend)
- [x] 5-layer gas optimization UX
- [x] Network guard (auto chain switch)
- [ ] Mainnet deployment
- [ ] Third-party security audit
- [ ] Mobile app (React Native)
- [ ] Multi-chain support (Polygon, Arbitrum, Base)
- [ ] Governance token ($1DM)
- [ ] NFT badges for winners

---

## 📝 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guidelines](CONTRIBUTING.md) before submitting a pull request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## ⚠️ Risk Disclosure

Smart contract interactions carry inherent risk. Never deposit more than you can afford to lose. Past performance does not guarantee future results. This is a decentralized protocol — no central operator can recover lost funds or reverse transactions.

---

## 📬 Contact

- **Website**: [1dollarmillion.com](https://1dollarmillion.com) (coming soon)
- **Twitter**: [@1DollarMillion](https://twitter.com/1DollarMillion) (coming soon)
- **Discord**: [Join our community](https://discord.gg/1dollarmillion) (coming soon)
- **Email**: contact@1dollarmillion.com

---

<div align="center">

**Built with ❤️ for the decentralized future**

</div>
