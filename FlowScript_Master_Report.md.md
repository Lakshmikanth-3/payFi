# FlowScript: PayFi Protocol Master Report
**Status:** Production Ready (Staged on GitHub)
**Network:** HashKey Chain Testnet (133)
**Chain ID:** 133

---

## 1. Executive Summary
FlowScript is a next-generation PayFi protocol designed for the HashKey ecosystem. It bridges natural language intent with high-fidelity on-chain execution. The protocol enables "Conversational Banking" where users deploy complex recurring payments, split-pays, and conditional transactions through a live AI Settlement Engine.

---

## 2. Technical Architecture

### 2.1 AI Intent Parsing Layer (API)
- **Engine:** Multi-Tier Failover System (`Gemini-3-Flash` -> `Gemini-1.5-Flash` -> `Gemini-Pro`).
- **Logic:** Direct natural language to JSON mapping.
- **Fail-Safe:** Implements a dynamic model resolver to bypass rate limits (429) and regional model restrictions (404) without using simulated mock data.
- **Location:** `app/api/parse/route.ts`

### 2.2 Smart Contract Registry
- **Registry Address:** `0x46251757A0008728C4Ac5766A5874f8bf1815484`
- **Core Contract:** `PayFiRegistry.sol`
- **Functionality:** Handles the deployment of Payment Flows, management of recurring triggers, and programmatic disbursements.
- **Integration:** Ethers.js v6 with optimized provider synchronization.

### 2.3 On-Chain Execution Engine
- **Gas Optimization:** Implements a fixed security gas limit of 250,000 units to bypass HashKey node estimation timeouts (-32603).
- **Triggers:** Supports `CRON` (recurring), `ON_RECEIVE` (conditional), and `MANUAL` (on-demand) execution.
- **Tokens:** Native HSK, USDT (Bridged), USDC, WETH.

---

## 3. Frontend & UX Design

### 3.1 Design Aesthetic
- **Visual Style:** Premium "Glassmorphism" with Neon Lime and Teal accents.
- **Key Modules:**
  - **Chat & Send:** Interactive conversational agent for flow deployment.
  - **Analytics:** Recharts-powered visualization using live transaction history.
  - **Activity Feed:** Real-time event monitoring (Parsed -> Deployed -> Execution).
  - **History:** Direct integration with the HashKey Explorer API for verified on-chain logs.

### 3.2 Security Features
- **Deterministic Validations:** Zero placeholder policy. All addresses and balances are pulled directly from the connected wallet.
- **Privacy:** Sensitive environment variables (`GEMINI_API_KEY`) are excluded via `.gitignore`.
- **Transparency:** Clear success/failure toast notifications with explorer links for every transaction.

---

## 4. Operational Status

| Component | Status | Source |
| :--- | :--- | :--- |
| AI Parser | ✅ LIVE | Gemini 1.5/3 API |
| Transaction Flow | ✅ STABLE | Fixed Gas Logic |
| Explorer Sync | ✅ ACTIVE | HashKey API v2 |
| UI Responsiveness | ✅ OPTIMIZED | Next.js Turbo |

---

## 5. Deployment Instructions
To run the production build locally:
1. Ensure `.env.local` contains a valid `GEMINI_API_KEY`.
2. Run `npm run build`.
3. Run `npm run start`.
4. Access the dashboard at `http://localhost:3000`.

---
*Report Generated: 2026-04-14*
*Version: 1.0.0-Stable*
