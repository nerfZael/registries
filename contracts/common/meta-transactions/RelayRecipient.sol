// SPDX-License-Identifier: MIT

pragma solidity ^0.8.9;

import "./RelayRecipientBase.sol";

abstract contract RelayRecipient is RelayRecipientBase {
    /**
     * Return the sender of this call.
     * if the call came through a trusted forwarder (EIP-2771), return the original sender.
     * if the call came from the contract itself (EIP-712 meta transactions), return the original sender.
     * otherwise, return `msg.sender`.
     * should be used in the contract anywhere instead of msg.sender
     */
    function msgSender()
        internal
        view
        returns (address payable sender)
    {
        if (isTrustedForwarder(msg.sender)) {
            // At this point we know that the sender is a trusted forwarder,
            // so we trust that the last bytes of msg.data are the verified sender address.
            // extract sender address from the end of msg.data
            assembly {
                sender := shr(96,calldataload(sub(calldatasize(),20)))
            }
        } else {
            sender = payable(msg.sender);
        }

        return sender;
    }
}
