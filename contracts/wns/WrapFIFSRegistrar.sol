// SPDX-License-Identifier: MIT

pragma solidity ^0.8.9;

import {ENSRegistry} from "@ensdomains/ens-contracts/contracts/registry/ENSRegistry.sol";
import {WrapRegistry} from "./WrapRegistry.sol";

contract WrapFIFSRegistrar {
    WrapRegistry wns;
    bytes32 rootNode;
    address publicResolver;

    modifier only_owner(bytes32 label) {
        address currentOwner = wns.owner(
            keccak256(abi.encodePacked(rootNode, label))
        );
        require(currentOwner == address(0x0) || currentOwner == msg.sender);
        _;
    }

    /**
     * Constructor.
     * @param wrapRegistry The address of the wrap registry.
     * @param node The node that this registrar administers.
     * @param resolver The default public resolver.
     */
    constructor(
        WrapRegistry wrapRegistry,
        bytes32 node,
        address resolver
    ) {
        wns = wrapRegistry;
        rootNode = node;
        publicResolver = resolver;
    }

    /**
     * Register a name, or change the owner of an existing registration.
     * @param label The hash of the label to register.
     * @param owner The address of the new owner.
     */
    function register(bytes32 label, address owner) public only_owner(label) {
        wns.setSubnodeRecord(rootNode, label, owner, publicResolver, 0);
    }
}
