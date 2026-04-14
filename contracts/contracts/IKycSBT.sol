// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IKycSBT {
    enum KycLevel  { NONE, BASIC, ADVANCED, PREMIUM, ULTIMATE }
    enum KycStatus { NONE, APPROVED, REVOKED }

    function isHuman(address account)
        external view returns (bool isValid, uint8 level);

    function getKycInfo(address account)
        external view returns (
            string memory ensName,
            KycLevel level,
            KycStatus status,
            uint256 createTime
        );

    function isEnsNameApproved(address user, string calldata ensName)
        external view returns (bool);

    function getTotalFee() external view returns (uint256);

    function requestKyc(string calldata ensName) external payable;
    function revokeKyc(address user) external;
    function restoreKyc(address user) external;
    function approveEnsName(address user, string calldata ensName) external;
}
