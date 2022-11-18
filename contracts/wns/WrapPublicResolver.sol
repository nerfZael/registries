// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import {PublicResolver, INameWrapper} from "@ensdomains/ens-contracts/contracts/resolvers/PublicResolver.sol";
import {WrapRegistry} from "./WrapRegistry.sol";

contract WrapPublicResolver is PublicResolver {
    constructor(WrapRegistry _wrap)
        PublicResolver(_wrap, INameWrapper(address(0)))
    {}
}
