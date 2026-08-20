// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract ProductIdentityRegistry {
    struct ProductIdentity {
        bytes32 assetId;
        uint64 chainId;
        address token;
        bytes32 productClass;
        bytes32 rightsHash;
        uint64 validUntil;
        address publisher;
        bool revoked;
        string uri;
    }

    address public owner;
    mapping(address => bool) public publishers;
    mapping(bytes32 => ProductIdentity) private products;

    event ProductPublished(bytes32 indexed productId, bytes32 indexed assetId, uint64 chainId, address token, bytes32 productClass, bytes32 rightsHash, uint64 validUntil, string uri);
    event ProductRevoked(bytes32 indexed productId);
    error Unauthorized();
    error InvalidProduct();

    constructor() { owner = msg.sender; publishers[msg.sender] = true; }
    modifier onlyOwner() { if (msg.sender != owner) revert Unauthorized(); _; }
    modifier onlyPublisher() { if (!publishers[msg.sender]) revert Unauthorized(); _; }
    function setPublisher(address publisher, bool allowed) external onlyOwner { publishers[publisher] = allowed; }

    function publish(bytes32 productId, bytes32 assetId, uint64 chainId, address token, bytes32 productClass, bytes32 rightsHash, uint64 validUntil, string calldata uri) external onlyPublisher {
        if (productId == bytes32(0) || assetId == bytes32(0) || productClass == bytes32(0) || rightsHash == bytes32(0) || validUntil <= block.timestamp) revert InvalidProduct();
        products[productId] = ProductIdentity(assetId, chainId, token, productClass, rightsHash, validUntil, msg.sender, false, uri);
        emit ProductPublished(productId, assetId, chainId, token, productClass, rightsHash, validUntil, uri);
    }

    function revoke(bytes32 productId) external onlyPublisher {
        ProductIdentity storage product = products[productId];
        if (product.publisher != msg.sender && msg.sender != owner) revert Unauthorized();
        product.revoked = true;
        emit ProductRevoked(productId);
    }

    function get(bytes32 productId) external view returns (ProductIdentity memory) { return products[productId]; }
    function isCurrent(bytes32 productId, bytes32 rightsHash) external view returns (bool) {
        ProductIdentity storage product = products[productId];
        return !product.revoked && product.rightsHash == rightsHash && product.validUntil >= block.timestamp;
    }
}
