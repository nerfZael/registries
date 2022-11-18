// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

interface IForwarderRegistry {
    function isForwarderFor(address, address) external view returns (bool);
}
