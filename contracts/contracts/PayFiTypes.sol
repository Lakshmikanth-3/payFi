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
