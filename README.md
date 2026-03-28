# VeriWork

> Privacy-first decentralized reputation and background verification system powered by blockchain and zero-knowledge proofs.

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Network: Sepolia](https://img.shields.io/badge/Network-Sepolia-627eea)](https://sepolia.etherscan.io/address/0xC4C324b8B8bf5bA7B0bF13460E13BfBb577aBfA4)
[![Frontend: Vercel](https://img.shields.io/badge/Frontend-Vercel-black)](https://vercel.com)
[![Storage: IPFS](https://img.shields.io/badge/Storage-IPFS%20%2F%20Pinata-65c2cb)](https://pinata.cloud)

---

## Overview

VeriWork eliminates manual background verification by letting employers record work experience on-chain and workers prove their credentials to recruiters — without ever exposing sensitive data.

Built with Ethereum smart contracts, IPFS decentralized storage, MetaMask authentication, and zk-SNARKs for zero-knowledge proof generation.

---

## Features

- **Privacy-preserving verification** — workers prove claims without revealing raw data
- **Immutable records** — work history stored on Sepolia blockchain
- **Decentralized storage** — documents pinned to IPFS via Pinata
- **Reputation scoring** — on-chain score calculated from verified records
- **Role-based UI** — separate flows for Admin, Employer, Worker, and Recruiter
- **Dark / Light theme** — DaisyUI powered theme switching

---

## Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Frontend   | React 18, Vite, TailwindCSS, DaisyUI |
| Blockchain | Solidity 0.8.20, Hardhat, Ethers.js  |
| Network    | Sepolia Testnet                      |
| Storage    | IPFS via Pinata                      |
| ZKP        | Circom + SnarkJS (in progress)       |
| Auth       | MetaMask                             |
| Deploy     | Vercel (frontend), Sepolia (contract)|

---

## Smart Contract

Deployed on **Sepolia Testnet**

```
0xC4C324b8B8bf5bA7B0bF13460E13BfBb577aBfA4
```

[View on Etherscan ↗](https://sepolia.etherscan.io/address/0xC4C324b8B8bf5bA7B0bF13460E13BfBb577aBfA4)

### Contract Functions

| Function | Access | Description |
|----------|--------|-------------|
| `addEmployer(address)` | Admin | Register a company wallet |
| `revokeEmployer(address)` | Admin | Remove employer access |
| `submitRecord(...)` | Employer | Upload work record to chain |
| `verifyRecord(id)` | Employer | Verify record and award reputation |
| `verifyZKProof(...)` | Public | Verify a zk-SNARK proof on-chain |
| `getWorkerRecordIds(address)` | Public | Fetch all record IDs for a worker |
| `getReputation(address)` | Public | Get a worker's reputation score |

---

## How It Works

```
1. Admin registers employer wallets
        ↓
2. Employer uploads work record → IPFS → stores hash on blockchain
        ↓
3. Smart contract calculates reputation score
        ↓
4. Worker generates zero-knowledge proof  (rating ≥ threshold, etc.)
        ↓
5. Recruiter verifies proof on-chain — no raw data exposed
```

### Reputation Formula

```
Score = (rating × 10) + (months worked × 5)
Max   = 200 points per record
```

---

## Project Structure

```
VeriWork/
├── blockchain/                 # Hardhat project
│   ├── contracts/
│   │   └── VeriWork.sol        # Main smart contract
│   ├── ignition/modules/
│   │   └── VeriWork.ts         # Deploy module
│   ├── hardhat.config.ts
│   └── .env                    # Private key + RPC + verifier address
│
└── client/                     # React + Vite app
    ├── src/
    │   ├── App.jsx              # Main app with role-based tabs
    │   ├── context/
    │   │   └── ThemeContext.jsx # Dark/light theme
    │   └── components/
    │       ├── RecordCard.jsx
    │       ├── VerifyRecordWidget.jsx
    │       └── ThemeToggle.jsx
        └── .env                    # Contract address + upload proxy URL
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- MetaMask browser extension
- Pinata account (free) — https://pinata.cloud
- Sepolia ETH — https://sepoliafaucet.com

### 1. Clone the repo

```bash
git clone https://github.com/your-username/veriwork.git
cd veriwork
```

### 2. Set up blockchain

```bash
cd blockchain
npm install
```

Create `.env`:
```
PRIVATE_KEY=your_metamask_private_key
ALCHEMY_SEPOLIA_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
VERIFIER_ADDRESS=0xDeployedVerifierAddress
```

Compile and deploy:
```bash
npx hardhat compile
npx hardhat ignition deploy ./ignition/modules/VeriWork.ts --network sepolia
```

### 3. Set up frontend

```bash
cd frontend
npm install
```

Create `.env`:
```
VITE_CONTRACT_ADDRESS=0xYourDeployedContractAddress
VITE_UPLOAD_API_URL=https://your-upload-proxy.example.com/api/upload
```

Do not expose Pinata credentials in the browser. Use a server-side upload proxy for production.

Run locally:
```bash
npm run dev
```

---

## Deployment

### Frontend → Vercel

1. Push frontend folder to GitHub
2. Import repo at https://vercel.com
3. Set build command: `npm run build`
4. Set output directory: `dist`
5. Add environment variables in Vercel dashboard
6. Deploy

### Smart Contract → Sepolia

```bash
cd blockchain
npx hardhat ignition deploy ./ignition/modules/VeriWork.ts --network sepolia
```

---

## Environment Variables

### blockchain/.env

| Variable | Description |
|----------|-------------|
| `PRIVATE_KEY` | MetaMask wallet private key |
| `ALCHEMY_SEPOLIA_URL` | Sepolia RPC endpoint |

### frontend/.env

| Variable | Description |
|----------|-------------|
| `VITE_CONTRACT_ADDRESS` | Deployed contract address |
| `VITE_PINATA_API_KEY` | Pinata API key |
| `VITE_PINATA_SECRET_API_KEY` | Pinata secret API key |

---

## Roadmap

- [x] Smart contract with reputation system
- [x] IPFS document storage via Pinata
- [x] Role-based UI (Admin / Employer / Worker / Recruiter)
- [x] Dark / Light theme
- [x] Deployed on Sepolia testnet
- [ ] Circom circuit for zk-SNARK proof generation
- [ ] On-chain proof verification via SnarkJS verifier
- [ ] Multi-signature employer approval
- [ ] Mainnet deployment

---

## Security

- Only registered employer wallets can submit records
- Admin wallet controls employer registration
- Work documents stored on IPFS — only the hash is on-chain
- Zero-knowledge proofs prevent raw data exposure to recruiters
- Private keys are never stored in code — always use `.env`

> **Never commit your `.env` file or private key to GitHub.**

---

## License

MIT — see [LICENSE](LICENSE)

---