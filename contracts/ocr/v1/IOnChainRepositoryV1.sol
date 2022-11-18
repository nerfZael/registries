// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import {IERC165} from "@openzeppelin/contracts/utils/introspection/IERC165.sol";

interface IOnChainRepositoryV1 is IERC165 {    
    error PublishNotStarted();
    error AlreadyPublished();
    error NotTheAuthor();
    
    event StartPublish(uint256 indexed packageIndex, address indexed author);
    event EndPublish(uint256 indexed packageIndex, uint64 partCount);
    event PackagePart(uint256 indexed packageIndex, uint64 partIndex, bytes data);

    struct Package {
        uint256 startBlock;
        uint256 endBlock;
        address author;
        uint64 partCount;
    }   

    function protocolVersion() external view returns (uint256);

    function startPublish(bytes memory data, bool end) external returns(uint256);
    function publishPart(uint256 packageIndex, bytes memory data, bool end) external;
    function package(uint256 packageIndex) external view returns(Package memory);
}