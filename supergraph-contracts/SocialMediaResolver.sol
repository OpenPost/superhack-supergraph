// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import { SchemaResolver } from "eas-contracts/SchemaResolver.sol"; // Import the SchemaResolver base contract
import { IEAS, Attestation } from "eas-contracts/IEAS.sol"; // Import the EAS interface

contract SocialMediaResolver is SchemaResolver {
    address private immutable guardian; // The guardian address allowed to make attestations

    constructor(IEAS eas, address _guardian) SchemaResolver(eas) {
        guardian = _guardian;
    }

    // Function to check if an attestation is allowed
    function onAttest(Attestation calldata attestation, uint256 /*value*/) internal view override returns (bool) {
        // Only allow attestations from the specified guardian
        return attestation.attester == guardian;
    }

    // Function to handle revocation of attestations
    function onRevoke(Attestation calldata /*attestation*/, uint256 /*value*/) internal pure override returns (bool) {
        return true;
    }
}
