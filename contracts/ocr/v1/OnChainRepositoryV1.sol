// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/utils/introspection/ERC165.sol";
import "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import "./IOnChainRepositoryV1.sol";

contract OnChainRepositoryV1 is IOnChainRepositoryV1, ERC165 {
    uint256 constant public override protocolVersion = 1; 

    mapping(uint256 => Package) private _packages;
    uint256 public packageCount;

    function startPublish(bytes memory data, bool end) public override returns(uint256) {
        uint256 packageIndex = ++packageCount;
        Package storage savedPackage = _packages[packageIndex];

        savedPackage.startBlock = block.number;
        savedPackage.author = msg.sender;

        emit StartPublish(packageIndex, msg.sender);

        _publishPart(savedPackage, packageIndex, data, end);

        return packageIndex;
    }

    function publishPart(uint256 packageIndex, bytes memory data, bool end) public override {
        Package storage savedPackage = _packages[packageIndex];

        if (savedPackage.startBlock == 0) {
            revert PublishNotStarted();
        }
        if (savedPackage.endBlock != 0) {
            revert AlreadyPublished();
        }
        if (msg.sender != savedPackage.author) {
            revert NotTheAuthor();
        }

        _publishPart(savedPackage, packageIndex, data, end);
    }

    function package(uint256 packageIndex) public override view returns(Package memory) {
        return _packages[packageIndex];
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC165, IERC165) returns (bool) {
        return interfaceId == type(IOnChainRepositoryV1).interfaceId 
            || super.supportsInterface(interfaceId);
    }

    function _publishPart(Package storage savedPackage, uint256 packageIndex, bytes memory data, bool end) private {
        emit PackagePart(packageIndex, savedPackage.partCount, data);

        savedPackage.partCount++;

        if (end) {
            savedPackage.endBlock = block.number;
            emit EndPublish(packageIndex, savedPackage.partCount);
        }
    }
}
