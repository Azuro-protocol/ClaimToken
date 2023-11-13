// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract ClaimToken is Ownable, ERC20 {
    uint256 public constant DAILY_CLAIM_LIMIT = 1000e6;
    mapping(address => uint256) private lastClaim;

    constructor(
        string memory name_,
        string memory symbol_
    ) ERC20(name_, symbol_) {}

    function burn(address account, uint256 amount) external onlyOwner {
        _burn(account, amount);
    }

    function mint(address account, uint256 amount) external onlyOwner {
        _mint(account, amount);
    }

    function claim() external {
        require(availableToClaim(msg.sender), "Not available tokens for claim");
        lastClaim[msg.sender] = block.timestamp;
        _mint(msg.sender, DAILY_CLAIM_LIMIT);
    }

    function decimals() public view virtual override returns (uint8) {
        return 6;
    }

    function availableToClaim(address account) public view returns (bool) {
        if ((block.timestamp - lastClaim[account]) >= 1 days) {
            return true;
        }
        return false;
    }
}
