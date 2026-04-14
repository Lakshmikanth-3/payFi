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

    constructor(address _registry, address payable _executor) {
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
