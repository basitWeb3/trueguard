// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract IntentCheckRegistry {
    enum Status { UNKNOWN, MATCH, PARTIAL_MATCH, MISMATCH }
    struct IntentCheck { bytes32 productId; bytes32 researchPackHash; Status status; uint64 checkedAt; uint64 validUntil; address checker; }

    mapping(address => bool) public checkers;
    mapping(bytes32 => IntentCheck) private checks;
    address public owner;

    event IntentCheckRecorded(bytes32 indexed checkId, bytes32 indexed productId, bytes32 indexed researchPackHash, Status status, uint64 validUntil, address checker);
    error Unauthorized();
    error InvalidCheck();

    constructor() { owner = msg.sender; checkers[msg.sender] = true; }
    modifier onlyOwner() { if (msg.sender != owner) revert Unauthorized(); _; }
    modifier onlyChecker() { if (!checkers[msg.sender]) revert Unauthorized(); _; }
    function setChecker(address checker, bool allowed) external onlyOwner { checkers[checker] = allowed; }

    function record(bytes32 checkId, bytes32 productId, bytes32 researchPackHash, Status status, uint64 validUntil) external onlyChecker {
        if (checkId == bytes32(0) || productId == bytes32(0) || researchPackHash == bytes32(0) || validUntil <= block.timestamp) revert InvalidCheck();
        checks[checkId] = IntentCheck(productId, researchPackHash, status, uint64(block.timestamp), validUntil, msg.sender);
        emit IntentCheckRecorded(checkId, productId, researchPackHash, status, validUntil, msg.sender);
    }
    function get(bytes32 checkId) external view returns (IntentCheck memory) { return checks[checkId]; }
    function canProceed(bytes32 checkId, bool explicitOverride) external view returns (bool) {
        IntentCheck storage result = checks[checkId];
        if (result.validUntil < block.timestamp || result.checkedAt == 0) return false;
        return result.status == Status.MATCH || result.status == Status.PARTIAL_MATCH || (result.status == Status.MISMATCH && explicitOverride);
    }
}
