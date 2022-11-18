// SPDX-License-Identifier:MIT
pragma solidity ^0.8.9;

/**
 * @dev A base contract to be inherited by any contract that wants to receive relayed transactions
 * A subclass must use "_msgSender()" instead of "msg.sender"
 */
abstract contract RelayRecipientBase {
    /**
     * Emitted when `tokenId` token is transferred from `from` to `to`.
     */
    event TrustedForwarderSet(address indexed forwarder, bool trusted);

    /**
     * @dev Forwarders we accept calls from
     */
    mapping(address => bool) public trustedForwarders;

    function isTrustedForwarder(address forwarder) public view returns(bool) {
        return trustedForwarders[forwarder];
    }

    function _setTrustedForwarder(address forwarder, bool trusted) internal {
        trustedForwarders[forwarder] = trusted;
        emit TrustedForwarderSet(forwarder, trusted);
    }
}