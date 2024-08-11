// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import { SchemaResolver } from "eas-contracts/SchemaResolver.sol"; // Import the SchemaResolver base contract
import { IEAS, Attestation } from "eas-contracts/IEAS.sol"; // Import the EAS interface

/**
 * @title SocialMediaResolver
 * @dev A resolver that verifies if an attestation is from a trusted guardian regarding social media verification.
 */
contract SocialMediaResolver is SchemaResolver {

    address private immutable guardian; // The guardian address allowed to make attestations

    /**
     * @dev Constructor that sets the EAS instance and the trusted guardian address.
     * @param eas The instance of the Ethereum Attestation Service.
     * @param _guardian The address of the guardian who can make attestations.
     */
    constructor(IEAS eas, address _guardian) SchemaResolver(eas) {
        guardian = _guardian;
    }

    /**
     * @dev Function to verify if an attestation is allowed based on the attester.
     * @param attestation The attestation being processed.
     * @return A boolean indicating whether the attestation is valid.
     */
    function onAttest(Attestation calldata attestation) internal view override returns (bool) {
        // Ensure that only the guardian can make the attestation
        return attestation.attester == guardian;
    }

    /**
     * @dev Function to handle revocation of attestations.
     * @param attestation The attestation being revoked.
     * @param value The Ether value sent with the transaction (not used in this example).
     * @return A boolean indicating whether the revocation is valid.
     */
    function onRevoke(Attestation calldata /*attestation*/) internal pure override returns (bool) {
        // Allow all revocations
        return true;
    }
}
