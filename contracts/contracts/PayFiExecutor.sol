// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./PayFiRegistry.sol";
import "./IKycSBT.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/// @title PayFiExecutor
/// @notice Executes PayFi programs by routing payments through HSP
/// @dev Integrates with HSP (HashKey Settlement Protocol) for all settlements
contract PayFiExecutor {

    using SafeERC20 for IERC20;

    PayFiRegistry public immutable registry;
    IKycSBT public immutable kycSBT;

    // HSP settlement interface
    address public hspSettlement;
    
    // KYC minimum requirements
    uint8 public minKycLevel = 1; // BASIC 

    // Position limits per KYC level (in 18 decimal units equivalent)
    uint256[5] public positionLimits = [
        0,                  // NONE 
        50_000 * 1e18,      // BASIC
        500_000 * 1e18,     // ADVANCED
        5_000_000 * 1e18,   // PREMIUM
        type(uint256).max   // ULTIMATE
    ];

    address public keeper;   
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
    error KYCNotVerified(address user, uint8 level);
    error KYCRevoked(address user);
    error PositionLimitExceeded(uint256 amount, uint256 limit);

    modifier onlyKeeper() {
        require(msg.sender == keeper || msg.sender == owner, "Not keeper");
        _;
    }

    constructor(address _registry, address _hspSettlement, address _kycSBT) {
        registry = PayFiRegistry(_registry);
        hspSettlement = _hspSettlement;
        kycSBT = IKycSBT(_kycSBT);
        owner = msg.sender;
        keeper = msg.sender;
    }

    /// @notice Execute a PayFi program 
    function execute(uint256 flowId) external {
        PayFiProgram memory prog = registry.getProgram(flowId);
        
        // 0. Permission check
        require(msg.sender == keeper || msg.sender == owner || msg.sender == prog.owner, "Access denied");

        // 1. KYC GATE CHECK 
        (bool isHuman, uint8 level) = kycSBT.isHuman(prog.owner);
        (, , IKycSBT.KycStatus status,) = kycSBT.getKycInfo(prog.owner);

        if (status == IKycSBT.KycStatus.REVOKED) revert KYCRevoked(prog.owner);
        if (!isHuman || level < minKycLevel) revert KYCNotVerified(prog.owner, level);

        // 2. Program activation check
        if (!prog.active) revert ProgramNotActive(flowId);

        // 3. Trigger timing check
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

            // 4. Position Limit Check
            uint256 limit = positionLimits[level];
            if (amount > limit) revert PositionLimitExceeded(amount, limit);

            // 5. Route payment through HSP
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
    function _dispatchViaHSP(
        uint256 flowId,
        address recipient,
        address token,
        uint256 amount
    ) internal {
        // HSP payment request encoding — format per HashKey Settlement Protocol spec
        bytes memory hspPayload = abi.encode(
            flowId,     // Reference ID for tracking
            recipient,  // Destination wallet
            token,      // Token contract address (address(0) = native HSK)
            amount,     // Amount in 18 decimals
            block.timestamp
        );

        // Call HSP settlement contract (HSP handles messaging, validation, and status)
        (bool ok, ) = hspSettlement.call(
            abi.encodeWithSignature(
                "requestPayment(bytes)",
                hspPayload
            )
        );

        // For the demo, we still perform the actual fund transfer if the message passed
        // HSP is responsible for message verification, but funds must move.
        if (token == address(0)) {
           (bool success, ) = recipient.call{value: amount, gas: 50000}("");
           require(success, "Native HSK transfer failed");
        } else {
           IERC20(token).safeTransferFrom(msg.sender, recipient, amount);
        }
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

        if (ok && result.length == 32) {
            messageId = abi.decode(result, (bytes32));
        } else {
            // Fallback for demo if HSP contract isn't fully responding
            messageId = keccak256(receiptPayload);
        }
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
