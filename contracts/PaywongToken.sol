// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/draft-ERC20Permit.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @custom:security-contact hai@paywong.com
contract PaywongToken is ERC20, ERC20Burnable, ERC20Permit, Ownable {
    constructor() ERC20("Paywong", "PWG") ERC20Permit("Paywong") {
        _mint(msg.sender, 1000000000 * 10 ** decimals());
    }
}
