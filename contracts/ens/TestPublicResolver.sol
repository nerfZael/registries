// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import {PublicResolver, INameWrapper} from "@ensdomains/ens-contracts/contracts/resolvers/PublicResolver.sol";
import "@ensdomains/ens-contracts/contracts/resolvers/PublicResolver.sol";

contract TestPublicResolver is PublicResolver {
  constructor(ENS _ens) PublicResolver(_ens, INameWrapper(address(0))) {}
}
