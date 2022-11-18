// SPDX-License-Identifier: MIT

pragma solidity ^0.8.9;

import {ENSRegistry} from "@ensdomains/ens-contracts/contracts/registry/ENSRegistry.sol";

contract WrapRegistry is ENSRegistry {
    constructor(address owner) {
        setOwner(0x0, owner);
    }
}

