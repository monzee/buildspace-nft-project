// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "hardhat/console.sol";
import "./libraries/Base64.sol";

contract MyEpicNFT is ERC721URIStorage {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    string baseSvg = "<svg xmlns='http://www.w3.org/2000/svg' preserveAspectRatio='xMinYMin meet' viewBox='0 0 350 350'><style>.base { fill: white; font-family: serif; font-size: 24px; }</style><rect width='100%' height='100%' fill='black' /><text x='50%' y='50%' class='base' dominant-baseline='middle' text-anchor='middle'>";

    string[] firstWords = ["Concerned", "Lush", "Quirky", "Steady", "Lucky", "Robust", "Lopsided", "Husky", "Superb", "Aware", "Cynical", "Fresh", "Tacky", "Somber", "Adamant"];
    string[] secondWords = ["Spider-Man", "Psylocke", "Nova", "Quasar", "Thing", "Morph", "Banshee", "Mantis", "Gambit", "Daredevil", "Quicksilver", "Jubilee", "Iceman", "Wolverine", "Warlock"];
    string[] thirdWords = ["Rimple", "Jollies", "Tabut", "Snowdon", "Pontons", "Siering", "Endopleura", "Seltzer", "Moke", "Signorina", "Hematin", "Weasand", "Kingpin", "Tushes", "Scamper"];

    event NewEpicNFTMinted(address sender, uint tokenId);

    constructor() ERC721 ("SquareNFT", "SQUARE") {
        console.log("This is my NFT contract. Yo");
    }

    function pickRandomFirstWord(uint tokenId) public view returns (string memory) {
        uint rand = random(string(abi.encodePacked("FIRST_WORD", Strings.toString(tokenId))));
        rand = rand % firstWords.length;
        return firstWords[rand];
    }

    function pickRandomSecondWord(uint tokenId) public view returns (string memory) {
        uint rand = random(string(abi.encodePacked("SECOND_WORD", Strings.toString(tokenId))));
        rand = rand % secondWords.length;
        return secondWords[rand];
    }

    function pickRandomThirdWord(uint tokenId) public view returns (string memory) {
        uint rand = random(string(abi.encodePacked("THIRD_WORD", Strings.toString(tokenId))));
        rand = rand % thirdWords.length;
        return thirdWords[rand];
    }

    function random(string memory input) internal pure returns (uint) {
        return uint256(keccak256(abi.encodePacked(input)));
    }

    function getMintedCount() public view returns (uint) {
        return _tokenIds.current();
    }

    function makeAnEpicNFT() public {
        uint newItemId = _tokenIds.current();
        require(newItemId < 50, "Exceeded max mints");
        string memory first = pickRandomFirstWord(newItemId);
        string memory second = pickRandomSecondWord(newItemId);
        string memory third = pickRandomThirdWord(newItemId);
        string memory combinedWord = string(abi.encodePacked(first, second, third));
        string memory finalSvg = string(abi.encodePacked(baseSvg, combinedWord, "</text></svg>"));
        string memory json = Base64.encode(bytes(string(abi.encodePacked(
            '{"name":"', combinedWord, '",',
            '"description": "Some random combo of words.",',
            '"image":"data:image/svg+xml;base64,',
            Base64.encode(bytes(finalSvg)),
            '"}'
        ))));
        string memory finalTokenUri = string(abi.encodePacked("data:application/json;base64,", json));
        console.log("\n----------");
        console.log(finalTokenUri);
        console.log("---------\n");
        _safeMint(msg.sender, newItemId);
        _setTokenURI(newItemId, finalTokenUri);
        _tokenIds.increment();
        console.log("New NFT Minted! id: %s for: %s", newItemId, msg.sender);
        emit NewEpicNFTMinted(msg.sender, newItemId);
    }
}

