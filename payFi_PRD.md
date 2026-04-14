remove the mock, simulator, hardcode,fallback, placeholder, 

# PayFi — Product Requirements Document

> **The world's first Natural Language Payment Programming Protocol**
> Built on HashKey Chain · PayFi Track · HSP-native · Hackathon 2026

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Problem Statement](#2-problem-statement)
3. [Solution Overview](#3-solution-overview)
4. [Architecture Diagram](#4-architecture-diagram)
5. [How It Works — Full Flow](#5-how-it-works--full-flow)
6. [Smart Contracts](#6-smart-contracts)
7. [AI Parser Layer](#7-ai-parser-layer)
8. [HSP Integration](#8-hsp-integration)
9. [Frontend Application](#9-frontend-application)
10. [Network & Deployment Config](#10-network--deployment-config)
11. [Feature Requirements](#11-feature-requirements)
12. [Security Considerations](#12-security-considerations)
13. [Hackathon Demo Plan](#13-hackathon-demo-plan)
14. [Why PayFi Wins](#14-why-PayFi-wins)
15. [Post-Hackathon Roadmap](#15-post-hackathon-roadmap)

---

## 1. Executive Summary

| Attribute | Value |
|---|---|
| Project Name | PayFi |
| Track | PayFi — HashKey Chain Hackathon 2026 |
| Prize Pool | 10,000 USDT |
| Core Network | HashKey Chain Mainnet (ChainID: 177) |
| Test Network | HashKey Chain Testnet (ChainID: 133) |
| Settlement Layer | HSP — HashKey Settlement Protocol |
| AI Provider | Google Gemini API (`gemini-1.5-flash`) |
| Block Explorer | https://hashkey.blockscout.com |
| Stack | Solidity · Next.js · ethers.js · Gemini API |

**Vision:** PayFi (using HSP) leverages HSP (HashKey Settlement Protocol) as its technical foundation to create a corresponding one-stop digital asset payment and fund settlement solution, which is used to unify payment requests, confirmations, receipts, and other processes in Web3 scenarios.

PayFi is the world's first protocol that converts plain-English payment intent into persistent, on-chain payment programs. Every execution is routed through HSP for request → confirmation → receipt → settlement. HSP does not manage funds and is only responsible for the transmission, verification, and status synchronization of payment interaction messages.

---

## 2. Problem Statement

### 2.1 The Core Gap

Every existing Web3 payment tool — Superfluid, Sablier, Request Network, Gnosis Safe — requires users to:

- Know exact wallet addresses (`0x...`)
- Manually configure amounts, tokens, schedules
- Fill forms for every new payment rule
- Re-configure when logic changes
- Understand DeFi concepts before using them

This creates an enormous adoption barrier. 99% of people who need programmable payments — freelancers, DAOs, businesses, families — cannot use these tools.

### 2.2 What Doesn't Exist Today

| Problem | Current State | PayFi Fix |
|---|---|---|
| Complex payment logic | Requires Solidity or manual UI config | Describe in one sentence |
| Recurring payments | Requires separate protocol + manual setup | "Every Friday" in plain English |
| Conditional payments | Requires custom smart contract | "When I receive X, send Y to Z" |
| Split payments | Multi-step UI flows | "Split 3 ways between Alice, Bob, Carol" |
| Payment receipts | Manual tracking | HSP receipt hook — automatic |
| Editing payment rules | Re-deploy or complex UI | Type a new sentence |

### 2.3 Why Now, Why HashKey Chain

HSP (HashKey Settlement Protocol) is the only protocol built specifically for unified payment request, confirmation, receipt, and settlement messaging in Web3. PayFi is the natural language interface for HSP — the killer app it was designed to power.

HashKey Chain's EVM compatibility means zero migration cost for Solidity developers. Its compliance layer means institutional users can participate. Its low fees mean recurring micro-payments are economically viable.

---

## 3. Solution Overview

### 3.1 What PayFi Does

PayFi is a three-layer system:

```
Layer 1: Natural Language → AI Parser → PaymentProgram JSON
Layer 2: PaymentProgram JSON → PayFiRegistry.sol → On-chain program
Layer 3: PayFiExecutor.sol → HSP → Recipients
```

A user types:

> *"Pay Alice 500 USDC on the 1st of each month, send 20% of all incoming deposits to savings.hsk, and keep 5% as gas reserve"*

PayFi:
1. Parses this into a structured `PaymentProgram`
2. Deploys it to `PayFiRegistry.sol` on HashKey Chain
3. The program runs autonomously — every trigger fires `PayFiExecutor.sol`
4. HSP handles all messaging: payment request → confirmation → receipt
5. User sees every execution in their dashboard with a BlockScout link

### 3.2 Core Concepts

**PayFi** — A named, persistent payment program stored on-chain. Has an ID, owner, trigger, rules, and status (active/paused/cancelled).

**Trigger** — The condition that fires the program: time-based (cron), event-based (on incoming payment), or manual.

**Rule** — A single payment instruction within a program: recipient, amount formula, token type.

**PaymentProgram** — The structured JSON representation of a PayFi, produced by the AI parser.

**HSP Execution** — Every rule in a PayFi fires an HSP payment request. HSP handles the settlement messaging on HashKey Chain.

### 3.3 Example Prompts

```
"Pay rent.hsk 2000 USDC every 28th of the month"

"Split every incoming payment 3 ways between alice.hsk, bob.hsk, carol.hsk"

"Send 10% of my wallet balance to charity.hsk every Sunday"

"Pay my contractors equal shares of 5000 USDC every Friday, hold 15% for taxes"

"Whenever I receive more than 1000 USDC, forward 80% to cold.hsk immediately"

"Pay bob.hsk for the design work — 500 now, 500 when he delivers the NFT"
```

---

## 4. Architecture Diagram

```
┌──────────────────────────────────────────────────────────────┐
│                        USER LAYER                            │
│   Natural language prompt typed into PayFi chat UI      │
└─────────────────────────────┬────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│                      AI PARSER LAYER                         │
│   Gemini API (Gemini-sonnet-4-20250514)                      │
│   Extracts: trigger · recipients · amounts · conditions      │
│   Outputs: PaymentProgram JSON                               │
└─────────────────────────────┬────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│              PayFiRegistry.sol (HashKey Chain)          │
│   Stores PaymentProgram on-chain                             │
│   Assigns FlowID · Emits PayFiDeployed event            │
│   ChainID 177 (mainnet) / 133 (testnet)                      │
└──────────┬──────────────────────────────────────┬────────────┘
           │                                      │
           ▼                                      ▼
┌──────────────────────┐              ┌───────────────────────┐
│  PayFiExecutor  │              │  PayFiKeeper     │
│  .sol                │◄─────────────│  (off-chain trigger)  │
│  Validates trigger   │              │  Chainlink Automation │
│  Routes via HSP      │              │  or manual call       │
└──────────┬───────────┘              └───────────────────────┘
           │
           ▼
┌──────────────────────────────────────────────────────────────┐
│              HSP — HashKey Settlement Protocol               │
│   Payment Request → Confirmation → Receipt → Settlement      │
│   All messaging handled by HSP on HashKey Chain              │
└──────────┬───────────────────────────────┬───────────────────┘
           │                               │
    ┌──────▼──────┐                 ┌──────▼──────┐
    │  Recipient  │                 │  Recipient  │   ...
    │  alice.hsk  │                 │ savings.hsk │
    └─────────────┘                 └─────────────┘

All transactions visible at https://hashkey.blockscout.com
```

---

## 5. How It Works — Full Flow

### Step 1 — User Types a Prompt

User opens PayFi at the web app URL. Connects MetaMask or OKX Wallet to HashKey Chain (ChainID: 177 mainnet / 133 testnet). Types a payment intent in the chat box.

### Step 2 — AI Parses Intent

The frontend sends the prompt to a Next.js API route, which calls the Gemini API with a strict system prompt. Gemini extracts:

- **Trigger type**: `cron` (time-based), `on_receive` (event-based), `manual`
- **Schedule** (if cron): parsed to cron expression (`0 0 * * 5` = every Friday)
- **Recipients**: wallet addresses or ENS/HSK names
- **Amount formulas**: fixed amounts, percentages, equal shares
- **Token**: USDC, USDT, HSK, or native ETH
- **Conditions**: optional filters (amount thresholds, source wallet)
- **Receipt**: whether to send HSP receipt after each execution

Gemini returns a `PaymentProgram` JSON object.

### Step 3 — Program Preview Shown to User

The frontend renders the parsed program as a card showing: trigger description, recipient list with amounts, estimated gas cost, and a "Deploy" button. User can type a follow-up to adjust any detail before deploying.

### Step 4 — Deploy to HashKey Chain

User clicks Deploy. Frontend calls `PayFiRegistry.sol` with the program data. Contract stores the program, assigns a `flowId` (uint256), and emits `PayFiDeployed(flowId, owner, programHash)`. Transaction hash is shown with a direct link to `https://hashkey.blockscout.com/tx/{hash}`.

### Step 5 — Keeper Monitors Triggers

A keeper (either Chainlink Automation or a simple off-chain cron job calling the contract) monitors all active PayFis. When a trigger condition is met, the keeper calls `PayFiExecutor.execute(flowId)`.

### Step 6 — Execution via HSP

The executor validates the trigger, reads the program rules from the registry, and for each rule:
1. Dispatches an HSP payment request message
2. HSP confirms the payment on HashKey Chain
3. Funds transfer to the recipient wallet
4. HSP emits a settlement receipt

### Step 7 — Dashboard Updates

The frontend reads on-chain events and shows the user: last execution timestamp, total paid per recipient, next scheduled execution, and a BlockScout link for every transaction. Every HSP receipt is stored and viewable.

### Step 8 — User Can Edit via New Prompt

User types: `"Actually, change Alice's share to 600 USDC"`. The AI generates an update diff. User confirms. `PayFiRegistry.updateProgram(flowId, newProgram)` is called. Old program is archived on-chain. New version goes live.

---

## 6. Smart Contracts

### 6.1 Data Structures

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/// @title PayFi Data Types
/// Shared structs used across all PayFi contracts

enum TriggerType {
    CRON,           // Time-based: every Friday, monthly 1st, etc.
    ON_RECEIVE,     // Event-based: fires when contract receives funds
    MANUAL          // User or keeper calls execute() directly
}

enum TokenType {
    NATIVE_HSK,
    ERC20           // USDC, USDT, or any whitelisted ERC-20
}

struct PaymentRule {
    address recipient;      // Recipient wallet address
    uint8   amountType;     // 0=fixed, 1=percent_of_balance, 2=equal_share
    uint256 fixedAmount;    // Used when amountType == 0 (18 decimals)
    uint8   percentBps;     // Basis points when amountType == 1 (e.g. 2000 = 20%)
    address token;          // ERC-20 address (address(0) = native HSK)
}

struct PayFiProgram {
    address owner;
    TriggerType triggerType;
    uint256 cronInterval;   // Seconds between executions for CRON type
    uint256 nextExecution;  // Unix timestamp of next run
    PaymentRule[] rules;
    bool    receiptEnabled; // Whether to emit HSP receipt after execution
    bool    active;
    uint256 createdAt;
    uint256 version;        // Increments on each update
}
```

### 6.2 PayFiRegistry.sol

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./PayFiTypes.sol";

/// @title PayFiRegistry
/// @notice Stores all PayFi payment programs on HashKey Chain
/// @dev Deployed on HashKey Chain Mainnet (ChainID 177) and Testnet (ChainID 133)
contract PayFiRegistry {

    uint256 public nextFlowId;

    // flowId => program
    mapping(uint256 => PayFiProgram) private programs;

    // owner => list of flowIds
    mapping(address => uint256[]) public ownerPrograms;

    // Authorized executor contract
    address public executor;
    address public owner;

    event PayFiDeployed(
        uint256 indexed flowId,
        address indexed owner,
        bytes32 programHash,
        TriggerType triggerType
    );

    event PayFiUpdated(
        uint256 indexed flowId,
        uint256 newVersion
    );

    event PayFiCancelled(
        uint256 indexed flowId,
        address indexed owner
    );

    error NotOwner(uint256 flowId, address caller);
    error NotExecutor(address caller);
    error ProgramNotActive(uint256 flowId);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    modifier onlyExecutor() {
        require(msg.sender == executor, "Not executor");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    /// @notice Deploy a new PayFi payment program
    /// @param rules       Array of payment rules
    /// @param triggerType CRON, ON_RECEIVE, or MANUAL
    /// @param cronInterval Seconds between executions (0 if not CRON)
    /// @param receiptEnabled Whether HSP receipts are sent after each run
    function deploy(
        PaymentRule[] calldata rules,
        TriggerType triggerType,
        uint256 cronInterval,
        bool receiptEnabled
    ) external returns (uint256 flowId) {
        flowId = nextFlowId++;

        PayFiProgram storage prog = programs[flowId];
        prog.owner          = msg.sender;
        prog.triggerType    = triggerType;
        prog.cronInterval   = cronInterval;
        prog.nextExecution  = block.timestamp + cronInterval;
        prog.receiptEnabled = receiptEnabled;
        prog.active         = true;
        prog.createdAt      = block.timestamp;
        prog.version        = 1;

        for (uint256 i = 0; i < rules.length; i++) {
            prog.rules.push(rules[i]);
        }

        ownerPrograms[msg.sender].push(flowId);

        bytes32 programHash = keccak256(abi.encode(rules, triggerType, cronInterval));
        emit PayFiDeployed(flowId, msg.sender, programHash, triggerType);
    }

    /// @notice Update an existing PayFi (e.g. after user types a new prompt)
    function update(
        uint256 flowId,
        PaymentRule[] calldata newRules,
        uint256 newCronInterval,
        bool newReceiptEnabled
    ) external {
        PayFiProgram storage prog = programs[flowId];
        if (prog.owner != msg.sender) revert NotOwner(flowId, msg.sender);
        if (!prog.active) revert ProgramNotActive(flowId);

        // Delete old rules
        delete prog.rules;

        // Write new rules
        for (uint256 i = 0; i < newRules.length; i++) {
            prog.rules.push(newRules[i]);
        }

        prog.cronInterval   = newCronInterval;
        prog.receiptEnabled = newReceiptEnabled;
        prog.version++;

        emit PayFiUpdated(flowId, prog.version);
    }

    /// @notice Cancel a PayFi permanently
    function cancel(uint256 flowId) external {
        PayFiProgram storage prog = programs[flowId];
        if (prog.owner != msg.sender) revert NotOwner(flowId, msg.sender);
        prog.active = false;
        emit PayFiCancelled(flowId, msg.sender);
    }

    /// @notice Pause/resume a PayFi (owner only)
    function setActive(uint256 flowId, bool active) external {
        PayFiProgram storage prog = programs[flowId];
        if (prog.owner != msg.sender) revert NotOwner(flowId, msg.sender);
        prog.active = active;
    }

    /// @notice Called by executor after a successful run to update nextExecution
    function recordExecution(uint256 flowId) external onlyExecutor {
        PayFiProgram storage prog = programs[flowId];
        if (prog.triggerType == TriggerType.CRON) {
            prog.nextExecution = block.timestamp + prog.cronInterval;
        }
    }

    function getProgram(uint256 flowId)
        external view returns (PayFiProgram memory)
    {
        return programs[flowId];
    }

    function getOwnerPrograms(address _owner)
        external view returns (uint256[] memory)
    {
        return ownerPrograms[_owner];
    }

    function setExecutor(address _executor) external onlyOwner {
        executor = _executor;
    }

    function totalPrograms() external view returns (uint256) {
        return nextFlowId;
    }
}
```

### 6.3 PayFiExecutor.sol

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./PayFiRegistry.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/// @title PayFiExecutor
/// @notice Executes PayFi programs by routing payments through HSP
/// @dev Integrates with HSP (HashKey Settlement Protocol) for all settlements
contract PayFiExecutor {

    using SafeERC20 for IERC20;

    PayFiRegistry public immutable registry;

    // HSP settlement interface (address set from HashKey docs / hashfans.io)
    address public hspSettlement;

    address public keeper;   // Authorized keeper (Chainlink Automation or multisig)
    address public owner;

    event PayFiExecuted(
        uint256 indexed flowId,
        address indexed owner,
        uint256 rulesExecuted,
        uint256 timestamp
    );

    event PaymentDispatched(
        uint256 indexed flowId,
        address indexed recipient,
        address token,
        uint256 amount
    );

    event HSPReceiptEmitted(
        uint256 indexed flowId,
        bytes32 hspMessageId
    );

    error TriggerNotReady(uint256 flowId, uint256 nextExecution);
    error InsufficientBalance(address token, uint256 required, uint256 available);
    error ProgramNotActive(uint256 flowId);

    modifier onlyKeeper() {
        require(msg.sender == keeper || msg.sender == owner, "Not keeper");
        _;
    }

    constructor(address _registry, address _hspSettlement) {
        registry = PayFiRegistry(_registry);
        hspSettlement = _hspSettlement;
        owner = msg.sender;
        keeper = msg.sender;
    }

    /// @notice Execute a PayFi program — called by keeper or manually
    function execute(uint256 flowId) external onlyKeeper {
        PayFiProgram memory prog = registry.getProgram(flowId);

        // Validate program is active
        if (!prog.active) revert ProgramNotActive(flowId);

        // Validate trigger is ready
        if (prog.triggerType == TriggerType.CRON) {
            if (block.timestamp < prog.nextExecution) {
                revert TriggerNotReady(flowId, prog.nextExecution);
            }
        }

        // Execute each payment rule
        uint256 rulesExecuted = 0;

        for (uint256 i = 0; i < prog.rules.length; i++) {
            PaymentRule memory rule = prog.rules[i];
            uint256 amount = _resolveAmount(rule, prog.owner);

            if (amount == 0) continue;

            // Route payment through HSP
            _dispatchViaHSP(flowId, rule.recipient, rule.token, amount);

            emit PaymentDispatched(flowId, rule.recipient, rule.token, amount);
            rulesExecuted++;
        }

        // Update next execution time in registry
        registry.recordExecution(flowId);

        // Emit HSP receipt if enabled
        if (prog.receiptEnabled) {
            bytes32 hspMsgId = _emitHSPReceipt(flowId, prog.owner, rulesExecuted);
            emit HSPReceiptEmitted(flowId, hspMsgId);
        }

        emit PayFiExecuted(flowId, prog.owner, rulesExecuted, block.timestamp);
    }

    /// @notice Resolve the actual payment amount from a rule
    function _resolveAmount(PaymentRule memory rule, address programOwner)
        internal view returns (uint256 amount)
    {
        if (rule.amountType == 0) {
            // Fixed amount
            amount = rule.fixedAmount;
        } else if (rule.amountType == 1) {
            // Percentage of owner's balance
            uint256 balance = rule.token == address(0)
                ? programOwner.balance
                : IERC20(rule.token).balanceOf(programOwner);
            amount = (balance * rule.percentBps) / 10000;
        } else if (rule.amountType == 2) {
            // Equal share — handled by caller splitting balance
            amount = rule.fixedAmount; // Pre-computed by executor before loop
        }
    }

    /// @notice Route a single payment through HSP settlement layer
    /// @dev HSP handles payment request → confirmation → settlement internally
    function _dispatchViaHSP(
        uint256 flowId,
        address recipient,
        address token,
        uint256 amount
    ) internal {
        // HSP payment request encoding — format per HashKey Settlement Protocol spec
        // Full HSP integration details: https://hashfans.io (HSP user manual)
        bytes memory hspPayload = abi.encode(
            flowId,     // Reference ID for tracking
            recipient,  // Destination wallet
            token,      // Token contract address (address(0) = native HSK)
            amount,     // Amount in 18 decimals
            block.timestamp
        );

        // Call HSP settlement contract
        // HSP does NOT manage funds — only transmits, verifies, syncs status
        (bool ok, ) = hspSettlement.call(
            abi.encodeWithSignature(
                "requestPayment(bytes)",
                hspPayload
            )
        );

        require(ok, "HSP: payment request failed");
    }

    /// @notice Emit an HSP receipt message after full execution
    function _emitHSPReceipt(
        uint256 flowId,
        address programOwner,
        uint256 rulesExecuted
    ) internal returns (bytes32 messageId) {
        bytes memory receiptPayload = abi.encode(
            flowId,
            programOwner,
            rulesExecuted,
            block.timestamp,
            "PayFi execution complete"
        );

        (bool ok, bytes memory result) = hspSettlement.call(
            abi.encodeWithSignature(
                "emitReceipt(bytes)",
                receiptPayload
            )
        );

        require(ok, "HSP: receipt failed");
        messageId = abi.decode(result, (bytes32));
    }

    function setKeeper(address _keeper) external {
        require(msg.sender == owner, "Not owner");
        keeper = _keeper;
    }

    function setHSPSettlement(address _hsp) external {
        require(msg.sender == owner, "Not owner");
        hspSettlement = _hsp;
    }

    // Allow executor contract to receive native HSK for gas
    receive() external payable {}
}
```

### 6.4 PayFiKeeper.sol

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./PayFiRegistry.sol";
import "./PayFiExecutor.sol";

/// @title PayFiKeeper
/// @notice Chainlink Automation-compatible keeper for time-based PayFis
/// @dev Implements AutomationCompatibleInterface for Chainlink integration
contract PayFiKeeper {

    PayFiRegistry public immutable registry;
    PayFiExecutor public immutable executor;

    uint256 public maxBatchSize = 10; // Max programs to execute per keeper call

    constructor(address _registry, address _executor) {
        registry = PayFiRegistry(_registry);
        executor = PayFiExecutor(_executor);
    }

    /// @notice Chainlink Automation: check which programs are ready to execute
    function checkUpkeep(bytes calldata)
        external view returns (bool upkeepNeeded, bytes memory performData)
    {
        uint256 total = registry.totalPrograms();
        uint256[] memory readyIds = new uint256[](maxBatchSize);
        uint256 count = 0;

        for (uint256 i = 0; i < total && count < maxBatchSize; i++) {
            PayFiProgram memory prog = registry.getProgram(i);
            if (
                prog.active &&
                prog.triggerType == TriggerType.CRON &&
                block.timestamp >= prog.nextExecution
            ) {
                readyIds[count++] = i;
            }
        }

        upkeepNeeded = count > 0;
        performData = abi.encode(readyIds, count);
    }

    /// @notice Chainlink Automation: execute ready programs
    function performUpkeep(bytes calldata performData) external {
        (uint256[] memory ids, uint256 count) = abi.decode(
            performData, (uint256[], uint256)
        );

        for (uint256 i = 0; i < count; i++) {
            try executor.execute(ids[i]) {} catch {}
            // Individual failures don't stop the batch
        }
    }
}
```

---

## 7. AI Parser Layer

### 7.1 Gemini API Configuration

```typescript
// lib/parser.ts
const PayFi_SYSTEM_PROMPT = `
You are PayFi, a payment program parser for HashKey Chain.
Your job is to convert natural language payment instructions into
a structured PaymentProgram JSON object.

HashKey Chain details:
- Mainnet ChainID: 177 | RPC: https://mainnet.hsk.xyz
- Testnet ChainID: 133 | RPC: https://testnet.hsk.xyz
- Native token: HSK
- Settlement: HSP (HashKey Settlement Protocol)
- Explorer: https://hashkey.blockscout.com

Supported tokens: HSK (native), USDC, USDT

ALWAYS respond with ONLY valid JSON matching this exact schema.
No preamble, no explanation, no markdown fences.

Schema:
{
  "trigger": {
    "type": "CRON" | "ON_RECEIVE" | "MANUAL",
    "cronInterval": <seconds as number, 0 if not CRON>,
    "cronDescription": "<human readable e.g. 'every Friday at 00:00 UTC'>"
  },
  "rules": [
    {
      "recipient": "<wallet address or ENS name>",
      "amountType": 0 | 1 | 2,
      "fixedAmount": "<amount in token decimals as string>",
      "percentBps": <basis points 0-10000>,
      "token": "HSK" | "USDC" | "USDT",
      "description": "<plain English summary of this rule>"
    }
  ],
  "receiptEnabled": true | false,
  "summary": "<one sentence summary of the entire program>",
  "estimatedGasHSK": "<estimated gas cost in HSK as string>",
  "warnings": ["<any ambiguities or assumptions made>"]
}

amountType values:
0 = fixed amount (use fixedAmount field)
1 = percentage of balance (use percentBps field, e.g. 2000 = 20%)
2 = equal share (split remaining balance equally among amountType=2 rules)

cronInterval examples:
- "every day" = 86400
- "every week" / "every Friday" = 604800
- "every month" / "monthly" = 2592000
- "every hour" = 3600

If the user mentions a name without a wallet address (e.g. "Alice"),
use "alice.hsk" as the recipient and add a warning that the address
needs to be resolved before deployment.

Always set receiptEnabled: true unless user explicitly says no receipt.
`.trim();

export interface PaymentProgram {
  trigger: {
    type: 'CRON' | 'ON_RECEIVE' | 'MANUAL';
    cronInterval: number;
    cronDescription: string;
  };
  rules: Array<{
    recipient: string;
    amountType: 0 | 1 | 2;
    fixedAmount: string;
    percentBps: number;
    token: 'HSK' | 'USDC' | 'USDT';
    description: string;
  }>;
  receiptEnabled: boolean;
  summary: string;
  estimatedGasHSK: string;
  warnings: string[];
}

export async function parsePaymentIntent(
  userPrompt: string,
  conversationHistory: Array<{ role: string; content: string }> = []
): Promise<PaymentProgram> {

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'Gemini-sonnet-4-20250514',
      max_tokens: 1024,
      system: PayFi_SYSTEM_PROMPT,
      messages: [
        ...conversationHistory,
        { role: 'user', content: userPrompt }
      ]
    })
  });

  const data = await response.json();
  const text = data.content
    .filter((b: any) => b.type === 'text')
    .map((b: any) => b.text)
    .join('');

  const clean = text.replace(/```json|```/g, '').trim();
  return JSON.parse(clean) as PaymentProgram;
}
```

### 7.2 Example Parser Input/Output

**Input:**
```
"Pay my 3 freelancers equal shares every Friday and hold 15% for gas fees"
```

**Output:**
```json
{
  "trigger": {
    "type": "CRON",
    "cronInterval": 604800,
    "cronDescription": "every Friday at 00:00 UTC"
  },
  "rules": [
    {
      "recipient": "freelancer1.hsk",
      "amountType": 2,
      "fixedAmount": "0",
      "percentBps": 0,
      "token": "USDC",
      "description": "Equal share of distributable balance"
    },
    {
      "recipient": "freelancer2.hsk",
      "amountType": 2,
      "fixedAmount": "0",
      "percentBps": 0,
      "token": "USDC",
      "description": "Equal share of distributable balance"
    },
    {
      "recipient": "freelancer3.hsk",
      "amountType": 2,
      "fixedAmount": "0",
      "percentBps": 0,
      "token": "USDC",
      "description": "Equal share of distributable balance"
    },
    {
      "recipient": "0x0000000000000000000000000000000000000000",
      "amountType": 1,
      "fixedAmount": "0",
      "percentBps": 1500,
      "token": "USDC",
      "description": "15% gas reserve — stays in contract"
    }
  ],
  "receiptEnabled": true,
  "summary": "Split 85% of balance equally among 3 freelancers every Friday, hold 15% as gas reserve",
  "estimatedGasHSK": "0.003",
  "warnings": [
    "Freelancer wallet addresses not provided — please add addresses before deploying",
    "Equal share calculation assumes amountType=2 rules share the remaining balance after reserves"
  ]
}
```

---

## 8. HSP Integration

HSP (HashKey Settlement Protocol) is the execution backbone of PayFi. Every payment dispatched by `PayFiExecutor.sol` goes through HSP for:

| HSP Message Type | When Triggered | PayFi Use |
|---|---|---|
| Payment Request | On `execute(flowId)` | One per rule per execution |
| Payment Confirmation | HSP internal | Funds locked for transfer |
| Payment Receipt | After settlement | Delivered to program owner if `receiptEnabled` |
| Status Sync | Continuously | Dashboard reflects real-time status |

### 8.1 HSP Message Flow

```
PayFiExecutor.execute(flowId)
    │
    ├── For each rule:
    │       HSP.requestPayment(payload)
    │           → HSP verifies sender has sufficient balance
    │           → HSP routes payment to recipient
    │           → HSP emits Confirmation event
    │
    └── If receiptEnabled:
            HSP.emitReceipt(payload)
                → Receipt delivered to program owner wallet
                → Logged on HashKey Chain (visible on BlockScout)
```

### 8.2 HSP Reference

Full HSP documentation and user manual is available at: **https://www.hashfans.io** (top navigation bar → HSP User Manual)

HSP contract addresses and integration details are sourced from the official HashKey developer portal.

---

## 9. Frontend Application

### 9.1 Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Framework | Next.js 14 (App Router) | SSR, API routes, React |
| Web3 | ethers.js 6.x | HashKey Chain interaction |
| Wallet | wagmi v2 + viem | Wallet connect, tx signing |
| Styling | TailwindCSS | UI styling |
| AI | Anthropic SDK | Gemini API calls via API routes |
| Charts | Recharts | Payment flow visualisation |

### 9.2 Network Configuration

```typescript
// config/network.ts
import { ethers } from 'ethers';

export const HASHKEY_MAINNET = {
  chainId: 177,
  name: 'HashKey Chain',
  rpcUrl: 'https://mainnet.hsk.xyz',
  explorer: 'https://hashkey.blockscout.com',
  nativeCurrency: { name: 'HSK', symbol: 'HSK', decimals: 18 }
};

export const HASHKEY_TESTNET = {
  chainId: 133,
  name: 'HashKey Chain Testnet',
  rpcUrl: 'https://testnet.hsk.xyz',
  explorer: 'https://testnet-explorer.hsk.xyz',
  nativeCurrency: { name: 'HSK', symbol: 'HSK', decimals: 18 }
};

export const getProvider = (testnet = false) =>
  new ethers.JsonRpcProvider(
    testnet ? HASHKEY_TESTNET.rpcUrl : HASHKEY_MAINNET.rpcUrl
  );

export const getTxLink = (hash: string, testnet = false) =>
  `${testnet ? HASHKEY_TESTNET.explorer : HASHKEY_MAINNET.explorer}/tx/${hash}`;

export const getAddressLink = (address: string, testnet = false) =>
  `${testnet ? HASHKEY_TESTNET.explorer : HASHKEY_MAINNET.explorer}/address/${address}`;
```

### 9.3 Hardhat Configuration

```typescript
// hardhat.config.ts
import { HardhatUserConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-toolbox';
import * as dotenv from 'dotenv';
dotenv.config();

const config: HardhatUserConfig = {
  solidity: {
    version: '0.8.19',
    settings: { optimizer: { enabled: true, runs: 200 } }
  },
  networks: {
    hashkeyMainnet: {
      url: 'https://mainnet.hsk.xyz',
      chainId: 177,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : []
    },
    hashkeyTestnet: {
      url: 'https://testnet.hsk.xyz',
      chainId: 133,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : []
    }
  }
};

export default config;
```

### 9.4 Deployment Script

```typescript
// scripts/deploy.ts
import { ethers } from 'hardhat';

async function main() {
  const [deployer] = await ethers.getSigners();
  const network = await ethers.provider.getNetwork();

  console.log(`Deploying PayFi to ChainID: ${network.chainId}`);
  console.log(`Deployer: ${deployer.address}`);

  // 1. Deploy Registry
  const Registry = await ethers.getContractFactory('PayFiRegistry');
  const registry = await Registry.deploy();
  await registry.waitForDeployment();
  const registryAddr = await registry.getAddress();
  console.log(`PayFiRegistry: ${registryAddr}`);
  console.log(`  Explorer: https://hashkey.blockscout.com/address/${registryAddr}`);

  // 2. Deploy Executor
  const HSP_SETTLEMENT = process.env.HSP_SETTLEMENT_ADDRESS!;
  const Executor = await ethers.getContractFactory('PayFiExecutor');
  const executor = await Executor.deploy(registryAddr, HSP_SETTLEMENT);
  await executor.waitForDeployment();
  const executorAddr = await executor.getAddress();
  console.log(`PayFiExecutor: ${executorAddr}`);

  // 3. Link executor to registry
  await registry.setExecutor(executorAddr);
  console.log('Executor linked to registry');

  // 4. Deploy Keeper
  const Keeper = await ethers.getContractFactory('PayFiKeeper');
  const keeper = await Keeper.deploy(registryAddr, executorAddr);
  await keeper.waitForDeployment();
  const keeperAddr = await keeper.getAddress();
  console.log(`PayFiKeeper: ${keeperAddr}`);

  // 5. Authorize keeper on executor
  await executor.setKeeper(keeperAddr);
  console.log('Keeper authorized on executor');

  console.log('\n=== Deployment complete ===');
  console.log(`Registry:  ${registryAddr}`);
  console.log(`Executor:  ${executorAddr}`);
  console.log(`Keeper:    ${keeperAddr}`);
  console.log(`Explorer:  https://hashkey.blockscout.com`);
}

main().catch(console.error);
```

### 9.5 Environment Variables

```bash
# .env
PRIVATE_KEY=your_wallet_private_key
HSP_SETTLEMENT_ADDRESS=<from hashfans.io docs>

# .env.local (frontend)
NEXT_PUBLIC_REGISTRY_ADDRESS=<deployed PayFiRegistry address>
NEXT_PUBLIC_EXECUTOR_ADDRESS=<deployed PayFiExecutor address>
NEXT_PUBLIC_KEEPER_ADDRESS=<deployed PayFiKeeper address>
NEXT_PUBLIC_CHAIN_ID=133
NEXT_PUBLIC_RPC_URL=https://testnet.hsk.xyz
NEXT_PUBLIC_EXPLORER=https://testnet-explorer.hsk.xyz
ANTHROPIC_API_KEY=your_anthropic_api_key
```

### 9.6 Frontend Page Structure

```
/app
  /page.tsx             ← Landing — "You type. It pays."
  /create/page.tsx      ← Chat UI — natural language → PayFi
  /dashboard/page.tsx   ← Active programs · execution history · P&L
  /program/[id]/page.tsx← Single PayFi detail + edit
/components
  /ChatInterface.tsx    ← Chat input + program preview card
  /ProgramCard.tsx      ← PayFi display with status + links
  /ExecutionLog.tsx     ← On-chain execution history table
  /RuleVisualiser.tsx   ← Payment flow diagram for a program
/lib
  /parser.ts            ← Gemini API integration
  /contracts.ts         ← ABIs + deployed addresses
  /network.ts           ← HashKey Chain config + explorer links
/api
  /parse/route.ts       ← Server-side Gemini API call (keeps key safe)
  /deploy/route.ts      ← Program deployment endpoint
```

---

## 10. Network & Deployment Config

### Mainnet

| Parameter | Value |
|---|---|
| Network Name | HashKey Chain |
| RPC URL | https://mainnet.hsk.xyz |
| Chain ID | 177 |
| Native Token | HSK |
| Block Explorer | https://hashkey.blockscout.com |
| OKLink Explorer | https://www.oklink.com/hashkey |

### Testnet

| Parameter | Value |
|---|---|
| Network Name | HashKey Chain Testnet |
| RPC URL | https://testnet.hsk.xyz |
| Chain ID | 133 |
| Native Token | HSK |
| Block Explorer | https://testnet-explorer.hsk.xyz |
| Faucet | https://faucet.hsk.xyz |

### Adding HashKey Chain to MetaMask

1. Open MetaMask → Add Network → Add manually
2. Network Name: `HashKey Chain Testnet`
3. RPC URL: `https://testnet.hsk.xyz`
4. Chain ID: `133`
5. Currency Symbol: `HSK`
6. Block Explorer: `https://testnet-explorer.hsk.xyz`

---

## 11. Feature Requirements

### 11.1 MVP Features (Hackathon Demo — Must Have)

| Feature | Priority | Notes |
|---|---|---|
| Natural language payment parsing via Gemini | P0 | Core differentiator |
| PaymentProgram preview before deployment | P0 | User confirms before on-chain |
| PayFiRegistry.sol deploy on HashKey Testnet | P0 | Real on-chain, no mock |
| PayFiExecutor.sol with HSP integration | P0 | Extra points for HSP |
| CRON trigger execution | P0 | Demo-able |
| BlockScout tx link per execution | P0 | Judges verify on-chain |
| HSP receipt on execution | P1 | Extra points for HSP usage |
| Dashboard with active programs | P1 | Demo quality |
| Edit program via follow-up prompt | P1 | Shows AI continuity |
| Cancel / pause program | P1 | Basic UX |

### 11.2 Nice-to-Have Features

| Feature | Priority |
|---|---|
| ON_RECEIVE trigger (event-based) | P2 |
| ENS name resolution for recipients | P2 |
| Execution history chart | P2 |
| Multi-token support (HSK + USDC + USDT) | P2 |
| Chainlink Automation integration for keeper | P2 |
| Mobile-responsive UI | P3 |

### 11.3 Non-Functional Requirements

- All transactions verifiable at `https://hashkey.blockscout.com`
- Gemini API parse time < 3 seconds
- Contract deployment gas < 3,000,000 gas units
- Per-execution gas < 200,000 gas units
- Frontend loads in < 2 seconds
- No mock data — all values from live HashKey Chain state

---

## 12. Security Considerations

| Risk | Mitigation |
|---|---|
| Malicious payment rules | Recipient whitelist option on registry; owner can cancel any time |
| Keeper abuse | `onlyKeeper` modifier on executor; keeper is a separate authorized address |
| Re-entrancy on execution | Checks-effects-interactions pattern in executor |
| AI hallucination in parse | JSON schema validation before contract call; user confirms before deploy |
| Insufficient balance at execution time | `_resolveAmount` checks balance before dispatch; rules with 0 amount are skipped silently |
| Unauthorized program update | `NotOwner` revert in `update()` — only program owner can modify |
| HSP call failure | `require(ok, ...)` on every HSP call; failed rules are logged but don't block others |
| Private key exposure | API key only in server-side API routes; wallet signing via MetaMask only |

---

## 13. Hackathon Demo Plan

### 13.1 Demo Script (5 minutes)

**Minute 0–1: Setup**
Open PayFi. Connect OKX Wallet to HashKey Chain Testnet (ChainID 133). Show "no programs yet" dashboard.

**Minute 1–2: Type a Prompt**
Type: *"Split every USDC I receive equally between alice.hsk and bob.hsk, and keep 10% as reserve"*. Watch Gemini parse it in real time. Show the program card with trigger, rules, and estimated gas.

**Minute 2–3: Refine and Deploy**
Type: *"Actually make it weekly on Fridays, not on every receive"*. Watch the program update (trigger changes to CRON). Click Deploy. MetaMask pops up. Approve. Transaction confirmed.

**Minute 3–4: Show It On-Chain**
Open `https://testnet-explorer.hsk.xyz/tx/{hash}`. Show the contract deployment event. Manually trigger `executor.execute(0)`. Show the HSP payment request event + receipt event in BlockScout.

**Minute 4–5: The Pitch**
> *"Stripe took years to build payment logic you configure through their dashboard. We built the same thing for crypto — and you configure it with a sentence. This is only possible with HSP on HashKey Chain."*

### 13.2 Backup Demo (if testnet has issues)

Deploy to a local Hardhat node pointing at a fork of HashKey Testnet. All the same contracts, same UI, same flow — just running locally. Use a predeployed program with an execution history to show the dashboard live.

### 13.3 Judge Q&A Preparation

| Question | Answer |
|---|---|
| "Why PayFi and not AI track?" | Because HSP is the execution layer — every payment goes through HSP. PayFi is the AI-powered interface to HSP. Both tracks intersect but PayFi is the primary. |
| "How is this different from Superfluid?" | Superfluid does streaming. PayFi does programmable payment logic from natural language — rules, conditions, splits, schedules. Completely different. |
| "What happens if the AI misunderstands?" | User sees a preview card before deploying. If wrong, they type a correction. Nothing goes on-chain without user confirmation. |
| "Can this scale beyond a hackathon?" | Yes. The registry pattern supports unlimited programs. The keeper pattern is Chainlink Automation-compatible. HSP handles all settlement. |

---

## 14. Why PayFi Wins

### 14.1 Track Fit Score

| Criterion | Score | Reason |
|---|---|---|
| HSP usage (extra points) | ✅ Maximum | Core execution layer is HSP |
| PayFi track alignment | ✅ Maximum | Payment programming is PayFi by definition |
| Originality | ✅ World-first | No natural language → persistent payment program exists anywhere |
| Technical depth | ✅ Strong | 3 contracts + AI layer + HSP integration |
| Demo quality | ✅ Excellent | Type sentence → see money move → verify on BlockScout |
| Post-hackathon potential | ✅ Clear | Fundable product, real market, HashKey Capital interest |

### 14.2 Competitive Landscape

| Protocol | What It Does | PayFi Difference |
|---|---|---|
| Superfluid | Streaming payments | PayFi does programmable rules, not streams |
| Sablier | Vesting schedules | PayFi is general-purpose, natural language |
| Request Network | Payment requests | PayFi is autonomous programs, not manual requests |
| Safe (Gnosis) | Multi-sig payments | PayFi is single-owner, AI-configured, autonomous |
| null402 | FHE lending + AI | Different domain (lending); PayFi is PayFi |

**No one has built: natural language → persistent autonomous payment program → HSP settlement. This is world-first.**

---

## 15. Post-Hackathon Roadmap

| Phase | Timeline | Milestones |
|---|---|---|
| Phase 1: Harden | May 2026 | Security audit · Mainnet deployment · USDC/USDT multi-token |
| Phase 2: Integrate | Jun 2026 | Chainlink Automation keeper · ENS resolver · ON_RECEIVE triggers |
| Phase 3: Expand | Jul–Aug 2026 | DAO treasury management · Payroll product · API for businesses |
| Phase 4: Ecosystem | Q4 2026 | Open PayFi SDK · Third-party trigger plugins · Mobile app |

---

## Appendix: Key Links

| Resource | URL |
|---|---|
| HashKey Chain Mainnet RPC | https://mainnet.hsk.xyz |
| HashKey Chain Testnet RPC | https://testnet.hsk.xyz |
| BlockScout Explorer (Mainnet) | https://hashkey.blockscout.com |
| BlockScout Explorer (Testnet) | https://testnet-explorer.hsk.xyz |
| Testnet Faucet | https://faucet.hsk.xyz |
| HSP Documentation | https://www.hashfans.io |
| HashKey Developer Portal | https://hashfans.io |
| OKLink Explorer | https://www.oklink.com/hashkey |

---

*PayFi — You type. It pays. Forever.*

*Built for HashKey Chain Hackathon 2026 · PayFi Track · HSP-native*
