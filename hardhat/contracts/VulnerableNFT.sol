// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract VulnerableNFT is ERC721, Ownable {
    uint256 private _tokenId;

    constructor() ERC721("VulnerableNFT", "VNFT") Ownable(msg.sender) {}

    function mint(address to) public  returns (uint256) {
        _tokenId += 1;
        _mint(to, _tokenId);
        return _tokenId;
    }
}