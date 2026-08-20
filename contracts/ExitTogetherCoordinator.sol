// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IERC20Minimal {
    function transfer(address to, uint256 value) external returns (bool);
    function transferFrom(address from, address to, uint256 value) external returns (bool);
}

/// @notice Escrows matching sell orders, verifies a firm signed quote, and
/// distributes the received token pro rata. Asset/product research lives in
/// separate TrueGuard registries; this contract only enforces settlement rules.
contract ExitTogetherCoordinator {
    enum BatchStatus { OPEN, SETTLED, CANCELLED }

    struct Batch {
        bytes32 productId;
        address sellToken;
        address buyToken;
        uint64 deadline;
        uint128 minBatchSellAmount;
        uint128 totalCommitted;
        uint128 totalMinimumBuy;
        uint128 settledBuyAmount;
        uint128 claimedSellAmount;
        uint128 claimedBuyAmount;
        uint32 activeOrderCount;
        BatchStatus status;
        address creator;
        bytes32 settlementQuoteId;
    }

    struct Order {
        uint64 batchId;
        uint128 sellAmount;
        uint128 minimumBuyAmount;
        address holder;
        bool active;
        bool claimed;
    }

    bytes32 public constant QUOTE_TYPEHASH = keccak256(
        "ExitTogetherQuote(uint256 chainId,address coordinator,uint64 batchId,uint128 sellAmount,uint128 buyAmount,uint64 validUntil,bytes32 quoteId,address executor)"
    );
    uint256 private constant SECP256K1_HALF_N =
        0x7fffffffffffffffffffffffffffffff5d576e7357a4501ddfe92f46681b20a0;

    address public owner;
    address public quoteSigner;
    uint64 public nextBatchId = 1;
    uint64 public nextOrderId = 1;
    uint256 private locked = 1;

    mapping(uint64 => Batch) public batches;
    mapping(uint64 => Order) public orders;
    mapping(uint64 => uint64[]) private batchOrderIds;
    mapping(bytes32 => bool) public usedQuoteIds;

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    event QuoteSignerChanged(address indexed previousSigner, address indexed newSigner);
    event BatchCreated(uint64 indexed batchId, bytes32 indexed productId, address indexed sellToken, address buyToken, uint128 minBatchSellAmount, uint64 deadline);
    event OrderJoined(uint64 indexed batchId, uint64 indexed orderId, address indexed holder, uint128 sellAmount, uint128 minimumBuyAmount);
    event OrderCancelled(uint64 indexed batchId, uint64 indexed orderId, address indexed holder, uint128 returnedSellAmount);
    event BatchSettled(uint64 indexed batchId, bytes32 indexed quoteId, address indexed executor, uint128 sellAmount, uint128 buyAmount);
    event ProceedsClaimed(uint64 indexed batchId, uint64 indexed orderId, address indexed holder, uint128 buyAmount);
    event BatchCancelled(uint64 indexed batchId);

    modifier onlyOwner() {
        require(msg.sender == owner, "OWNER_ONLY");
        _;
    }

    modifier nonReentrant() {
        require(locked == 1, "REENTRANT");
        locked = 2;
        _;
        locked = 1;
    }

    constructor(address quoteSigner_) {
        require(quoteSigner_ != address(0), "ZERO_SIGNER");
        owner = msg.sender;
        quoteSigner = quoteSigner_;
        emit OwnershipTransferred(address(0), msg.sender);
        emit QuoteSignerChanged(address(0), quoteSigner_);
    }

    function createBatch(
        bytes32 productId,
        address sellToken,
        address buyToken,
        uint128 minBatchSellAmount,
        uint64 deadline
    ) external returns (uint64 batchId) {
        require(productId != bytes32(0), "PRODUCT_REQUIRED");
        require(sellToken != address(0) && buyToken != address(0) && sellToken != buyToken, "TOKEN_PAIR");
        require(minBatchSellAmount > 0, "MIN_BATCH");
        require(deadline > block.timestamp, "DEADLINE");

        batchId = nextBatchId++;
        batches[batchId] = Batch({
            productId: productId,
            sellToken: sellToken,
            buyToken: buyToken,
            deadline: deadline,
            minBatchSellAmount: minBatchSellAmount,
            totalCommitted: 0,
            totalMinimumBuy: 0,
            settledBuyAmount: 0,
            claimedSellAmount: 0,
            claimedBuyAmount: 0,
            activeOrderCount: 0,
            status: BatchStatus.OPEN,
            creator: msg.sender,
            settlementQuoteId: bytes32(0)
        });
        emit BatchCreated(batchId, productId, sellToken, buyToken, minBatchSellAmount, deadline);
    }

    function joinBatch(uint64 batchId, uint128 sellAmount, uint128 minimumBuyAmount)
        external
        nonReentrant
        returns (uint64 orderId)
    {
        Batch storage batch = batches[batchId];
        require(batch.status == BatchStatus.OPEN, "BATCH_NOT_OPEN");
        require(block.timestamp < batch.deadline, "BATCH_EXPIRED");
        require(sellAmount > 0 && minimumBuyAmount > 0, "ZERO_AMOUNT");
        require(batchOrderIds[batchId].length < 128, "BATCH_ORDER_LIMIT");

        orderId = nextOrderId++;
        orders[orderId] = Order(batchId, sellAmount, minimumBuyAmount, msg.sender, true, false);
        batchOrderIds[batchId].push(orderId);
        batch.totalCommitted += sellAmount;
        batch.totalMinimumBuy += minimumBuyAmount;
        batch.activeOrderCount += 1;

        _safeTransferFrom(batch.sellToken, msg.sender, address(this), sellAmount);
        emit OrderJoined(batchId, orderId, msg.sender, sellAmount, minimumBuyAmount);
    }

    function cancelOrder(uint64 orderId) external nonReentrant {
        Order storage order = orders[orderId];
        require(order.holder == msg.sender, "HOLDER_ONLY");
        require(order.active && !order.claimed, "ORDER_INACTIVE");
        Batch storage batch = batches[order.batchId];
        require(batch.status == BatchStatus.OPEN, "BATCH_NOT_OPEN");

        order.active = false;
        batch.totalCommitted -= order.sellAmount;
        batch.totalMinimumBuy -= order.minimumBuyAmount;
        batch.activeOrderCount -= 1;
        _safeTransfer(batch.sellToken, msg.sender, order.sellAmount);
        emit OrderCancelled(order.batchId, orderId, msg.sender, order.sellAmount);
    }

    function settleBatch(
        uint64 batchId,
        uint128 buyAmount,
        uint64 validUntil,
        bytes32 quoteId,
        bytes calldata signature
    ) external nonReentrant {
        Batch storage batch = batches[batchId];
        require(batch.status == BatchStatus.OPEN, "BATCH_NOT_OPEN");
        require(block.timestamp <= batch.deadline && block.timestamp <= validUntil, "QUOTE_EXPIRED");
        require(batch.totalCommitted >= batch.minBatchSellAmount, "BATCH_TOO_SMALL");
        require(buyAmount >= batch.totalMinimumBuy, "HOLDER_LIMIT");
        require(!usedQuoteIds[quoteId], "QUOTE_USED");

        uint64[] storage includedOrderIds = batchOrderIds[batchId];
        for (uint256 index = 0; index < includedOrderIds.length; index++) {
            Order storage includedOrder = orders[includedOrderIds[index]];
            if (!includedOrder.active) continue;
            uint256 allocated = uint256(buyAmount) * includedOrder.sellAmount / batch.totalCommitted;
            require(allocated >= includedOrder.minimumBuyAmount, "HOLDER_LIMIT");
        }

        bytes32 digest = quoteDigest(batchId, batch.totalCommitted, buyAmount, validUntil, quoteId, msg.sender);
        require(_recover(digest, signature) == quoteSigner, "INVALID_QUOTE");

        usedQuoteIds[quoteId] = true;
        batch.status = BatchStatus.SETTLED;
        batch.settledBuyAmount = buyAmount;
        batch.settlementQuoteId = quoteId;

        _safeTransferFrom(batch.buyToken, msg.sender, address(this), buyAmount);
        _safeTransfer(batch.sellToken, msg.sender, batch.totalCommitted);
        emit BatchSettled(batchId, quoteId, msg.sender, batch.totalCommitted, buyAmount);
    }

    function claim(uint64 orderId) external nonReentrant returns (uint128 proceeds) {
        Order storage order = orders[orderId];
        require(order.holder == msg.sender, "HOLDER_ONLY");
        require(order.active && !order.claimed, "ORDER_INACTIVE");
        Batch storage batch = batches[order.batchId];
        require(batch.status == BatchStatus.SETTLED, "NOT_SETTLED");

        order.claimed = true;
        order.active = false;
        uint128 nextClaimedSell = batch.claimedSellAmount + order.sellAmount;
        if (nextClaimedSell == batch.totalCommitted) {
            proceeds = batch.settledBuyAmount - batch.claimedBuyAmount;
        } else {
            proceeds = uint128(uint256(batch.settledBuyAmount) * order.sellAmount / batch.totalCommitted);
        }
        require(proceeds >= order.minimumBuyAmount, "HOLDER_LIMIT");
        batch.claimedSellAmount = nextClaimedSell;
        batch.claimedBuyAmount += proceeds;
        _safeTransfer(batch.buyToken, msg.sender, proceeds);
        emit ProceedsClaimed(order.batchId, orderId, msg.sender, proceeds);
    }

    function cancelBatch(uint64 batchId) external {
        Batch storage batch = batches[batchId];
        require(batch.status == BatchStatus.OPEN, "BATCH_NOT_OPEN");
        require(msg.sender == batch.creator || msg.sender == owner, "CREATOR_OR_OWNER");
        batch.status = BatchStatus.CANCELLED;
        emit BatchCancelled(batchId);
    }

    function withdrawFromCancelledBatch(uint64 orderId) external nonReentrant {
        Order storage order = orders[orderId];
        require(order.holder == msg.sender, "HOLDER_ONLY");
        require(order.active && !order.claimed, "ORDER_INACTIVE");
        Batch storage batch = batches[order.batchId];
        require(batch.status == BatchStatus.CANCELLED, "NOT_CANCELLED");
        order.active = false;
        _safeTransfer(batch.sellToken, msg.sender, order.sellAmount);
        emit OrderCancelled(order.batchId, orderId, msg.sender, order.sellAmount);
    }

    function quoteDigest(
        uint64 batchId,
        uint128 sellAmount,
        uint128 buyAmount,
        uint64 validUntil,
        bytes32 quoteId,
        address executor
    ) public view returns (bytes32) {
        return keccak256(abi.encode(
            QUOTE_TYPEHASH,
            block.chainid,
            address(this),
            batchId,
            sellAmount,
            buyAmount,
            validUntil,
            quoteId,
            executor
        ));
    }

    function getBatchOrderIds(uint64 batchId) external view returns (uint64[] memory) {
        return batchOrderIds[batchId];
    }

    function setQuoteSigner(address nextSigner) external onlyOwner {
        require(nextSigner != address(0), "ZERO_SIGNER");
        emit QuoteSignerChanged(quoteSigner, nextSigner);
        quoteSigner = nextSigner;
    }

    function transferOwnership(address nextOwner) external onlyOwner {
        require(nextOwner != address(0), "ZERO_OWNER");
        emit OwnershipTransferred(owner, nextOwner);
        owner = nextOwner;
    }

    function _recover(bytes32 digest, bytes calldata signature) private pure returns (address signer) {
        require(signature.length == 65, "SIGNATURE_LENGTH");
        bytes32 r;
        bytes32 s;
        uint8 v;
        assembly {
            r := calldataload(signature.offset)
            s := calldataload(add(signature.offset, 32))
            v := byte(0, calldataload(add(signature.offset, 64)))
        }
        require(uint256(s) <= SECP256K1_HALF_N && (v == 27 || v == 28), "SIGNATURE_VALUE");
        signer = ecrecover(digest, v, r, s);
        require(signer != address(0), "SIGNATURE_RECOVERY");
    }

    function _safeTransfer(address token, address to, uint256 value) private {
        (bool ok, bytes memory data) = token.call(abi.encodeCall(IERC20Minimal.transfer, (to, value)));
        require(ok && (data.length == 0 || abi.decode(data, (bool))), "TOKEN_TRANSFER");
    }

    function _safeTransferFrom(address token, address from, address to, uint256 value) private {
        (bool ok, bytes memory data) = token.call(abi.encodeCall(IERC20Minimal.transferFrom, (from, to, value)));
        require(ok && (data.length == 0 || abi.decode(data, (bool))), "TOKEN_TRANSFER_FROM");
    }
}
