// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract ResearchPackRegistry {
    struct ResearchPack {
        bytes32 evidenceRoot;
        bytes32 contentHash;
        uint64 publishedAt;
        uint64 validUntil;
        uint32 schemaVersion;
        address publisher;
        bool revoked;
        string uri;
    }

    address public owner;
    mapping(address => bool) public publishers;
    mapping(bytes32 => ResearchPack) private packs;

    event PublisherUpdated(address indexed publisher, bool allowed);
    event ResearchPackPublished(bytes32 indexed assetId, bytes32 indexed contentHash, bytes32 evidenceRoot, uint64 validUntil, uint32 schemaVersion, address publisher, string uri);
    event ResearchPackRevoked(bytes32 indexed assetId, bytes32 indexed contentHash);

    error NotOwner();
    error NotPublisher();
    error InvalidPack();

    constructor() {
        owner = msg.sender;
        publishers[msg.sender] = true;
        emit PublisherUpdated(msg.sender, true);
    }

    modifier onlyOwner() { if (msg.sender != owner) revert NotOwner(); _; }
    modifier onlyPublisher() { if (!publishers[msg.sender]) revert NotPublisher(); _; }

    function setPublisher(address publisher, bool allowed) external onlyOwner {
        publishers[publisher] = allowed;
        emit PublisherUpdated(publisher, allowed);
    }

    function transferOwnership(address nextOwner) external onlyOwner {
        if (nextOwner == address(0)) revert InvalidPack();
        owner = nextOwner;
    }

    function publish(bytes32 assetId, bytes32 evidenceRoot, bytes32 contentHash, uint64 validUntil, uint32 schemaVersion, string calldata uri) external onlyPublisher {
        if (assetId == bytes32(0) || contentHash == bytes32(0) || validUntil <= block.timestamp || schemaVersion == 0) revert InvalidPack();
        packs[assetId] = ResearchPack(evidenceRoot, contentHash, uint64(block.timestamp), validUntil, schemaVersion, msg.sender, false, uri);
        emit ResearchPackPublished(assetId, contentHash, evidenceRoot, validUntil, schemaVersion, msg.sender, uri);
    }

    function revoke(bytes32 assetId) external onlyPublisher {
        ResearchPack storage pack = packs[assetId];
        if (pack.publisher != msg.sender && msg.sender != owner) revert NotPublisher();
        pack.revoked = true;
        emit ResearchPackRevoked(assetId, pack.contentHash);
    }

    function get(bytes32 assetId) external view returns (ResearchPack memory) { return packs[assetId]; }
    function isCurrent(bytes32 assetId, bytes32 contentHash) external view returns (bool) {
        ResearchPack storage pack = packs[assetId];
        return !pack.revoked && pack.contentHash == contentHash && pack.validUntil >= block.timestamp;
    }
}
