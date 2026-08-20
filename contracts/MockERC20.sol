// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @notice Testnet-only ERC-20 used to demonstrate ExitTogether end to end.
/// It represents neither equity nor a claim on a real-world asset.
contract MockERC20 {
    string public name;
    string public symbol;
    uint8 public constant decimals = 18;
    uint256 public totalSupply;
    address public immutable owner;
    uint256 public immutable faucetAmount;

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;
    mapping(address => bool) public hasClaimedFaucet;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);

    constructor(string memory name_, string memory symbol_, uint256 faucetAmount_) {
        name = name_;
        symbol = symbol_;
        owner = msg.sender;
        faucetAmount = faucetAmount_;
    }

    function approve(address spender, uint256 value) external returns (bool) {
        allowance[msg.sender][spender] = value;
        emit Approval(msg.sender, spender, value);
        return true;
    }

    function transfer(address to, uint256 value) external returns (bool) {
        _transfer(msg.sender, to, value);
        return true;
    }

    function transferFrom(address from, address to, uint256 value) external returns (bool) {
        uint256 permitted = allowance[from][msg.sender];
        require(permitted >= value, "ALLOWANCE");
        if (permitted != type(uint256).max) {
            allowance[from][msg.sender] = permitted - value;
            emit Approval(from, msg.sender, permitted - value);
        }
        _transfer(from, to, value);
        return true;
    }

    function mint(address to, uint256 value) external {
        require(msg.sender == owner, "OWNER_ONLY");
        _mint(to, value);
    }

    function faucet() external {
        require(faucetAmount > 0, "FAUCET_DISABLED");
        require(!hasClaimedFaucet[msg.sender], "FAUCET_ALREADY_USED");
        hasClaimedFaucet[msg.sender] = true;
        _mint(msg.sender, faucetAmount);
    }

    function _mint(address to, uint256 value) internal {
        require(to != address(0), "ZERO_ADDRESS");
        totalSupply += value;
        balanceOf[to] += value;
        emit Transfer(address(0), to, value);
    }

    function _transfer(address from, address to, uint256 value) internal {
        require(to != address(0), "ZERO_ADDRESS");
        uint256 balance = balanceOf[from];
        require(balance >= value, "BALANCE");
        balanceOf[from] = balance - value;
        balanceOf[to] += value;
        emit Transfer(from, to, value);
    }
}
