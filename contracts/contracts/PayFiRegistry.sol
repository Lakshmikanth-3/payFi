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
    ) external payable returns (uint256 flowId) {
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

        // Forward initial funding to executor if provided
        if (msg.value > 0 && executor != address(0)) {
            (bool success, ) = executor.call{value: msg.value}("");
            // require(success, "Forwarding to executor failed");
        }

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
