// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SocialProfileRegistry {
    struct SocialMedia {
        string handle;
        bytes32 attestationUID; // UID from EAS attestation
    }

    struct UserProfile {

        string pshandle;
        SocialMedia twitter;
        SocialMedia instagram;
        SocialMedia facebook;
        SocialMedia medium;
        SocialMedia threads;
        SocialMedia farcaster;
        SocialMedia mastodon;
        // address account;
        // string[] freinds;
        // string[] trustedBy (length * freinds of freind);
    }

    // Mapping from .PS handle to user profile
    mapping(string => UserProfile) private profilesByPshandle;

    // Unified mapping from any social media handle to .PS handle for reverse lookup
    mapping(string => string) private socialMediaToPshandle;

    // Mapping to store verification requests
    mapping(string => bytes32) private verificationRequests;

    // Address of the Guardian (server)
    address public guardian;

    // Modifier to restrict access to the guardian
    modifier onlyGuardian() {
        require(msg.sender == guardian, "Not authorized");
        _;
    }

    // Event emitted when a verification request is created
    event VerificationRequested(
        string indexed pshandle,
        string socialMedia,
        bytes32 hash
    );

    // Event emitted when a profile is updated
    event ProfileUpdated(string indexed pshandle);

    // Constructor to set the guardian address
    constructor(address _guardian) {
        guardian = _guardian;
    }

    // Function for the guardian to create a verification request
    function requestVerification(
        string memory pshandle,
        string memory socialMedia,
        string memory otp
    ) public onlyGuardian {
        bytes32 hash = keccak256(abi.encodePacked(otp));
        verificationRequests[socialMedia] = hash;
        emit VerificationRequested(pshandle, socialMedia, hash);
    }

    // Function for the user to complete the verification
    function completeVerification(
        string memory pshandle,
        string memory socialMedia,
        string memory otp,
        string memory socialMediaHandle,
        bytes32 attestationUID
    ) public onlyGuardian {
        bytes32 hash = keccak256(abi.encodePacked(otp));
        require(hash == verificationRequests[socialMedia], "Invalid secret.");

        UserProfile storage profile = profilesByPshandle[pshandle];
        SocialMedia memory newSocialMedia = SocialMedia({
            handle: socialMediaHandle,
            attestationUID: attestationUID
        });

        if (keccak256(bytes(socialMedia)) == keccak256(bytes("twitter"))) {
            profile.twitter = newSocialMedia;
        } else if (
            keccak256(bytes(socialMedia)) == keccak256(bytes("instagram"))
        ) {
            profile.instagram = newSocialMedia;
        } else if (
            keccak256(bytes(socialMedia)) == keccak256(bytes("facebook"))
        ) {
            profile.facebook = newSocialMedia;
        } else if (
            keccak256(bytes(socialMedia)) == keccak256(bytes("medium"))
        ) {
            profile.medium = newSocialMedia;
        } else if (
            keccak256(bytes(socialMedia)) == keccak256(bytes("threads"))
        ) {
            profile.threads = newSocialMedia;
        } else if (
            keccak256(bytes(socialMedia)) == keccak256(bytes("farcaster"))
        ) {
            profile.farcaster = newSocialMedia;
        } else if (
            keccak256(bytes(socialMedia)) == keccak256(bytes("mastodon"))
        ) {
            profile.mastodon = newSocialMedia;
        }

        socialMediaToPshandle[socialMediaHandle] = pshandle;
        delete verificationRequests[socialMedia];
        emit ProfileUpdated(pshandle);
    }

    // Function to set or update a user profile directly (without verification)
    function setUserProfile(
        string memory pshandle,
        SocialMedia memory twitter,
        SocialMedia memory instagram,
        SocialMedia memory facebook,
        SocialMedia memory medium,
        SocialMedia memory threads,
        SocialMedia memory farcaster,
        SocialMedia memory mastodon
    ) public {
        profilesByPshandle[pshandle] = UserProfile(
            pshandle,
            twitter,
            instagram,
            facebook,
            medium,
            threads,
            farcaster,
            mastodon
        );

        // Update reverse lookup table
        if (bytes(twitter.handle).length > 0)
            socialMediaToPshandle[twitter.handle] = pshandle;
        if (bytes(instagram.handle).length > 0)
            socialMediaToPshandle[instagram.handle] = pshandle;
        if (bytes(facebook.handle).length > 0)
            socialMediaToPshandle[facebook.handle] = pshandle;
        if (bytes(medium.handle).length > 0)
            socialMediaToPshandle[medium.handle] = pshandle;
        if (bytes(threads.handle).length > 0)
            socialMediaToPshandle[threads.handle] = pshandle;
        if (bytes(farcaster.handle).length > 0)
            socialMediaToPshandle[farcaster.handle] = pshandle;
        if (bytes(mastodon.handle).length > 0)
            socialMediaToPshandle[mastodon.handle] = pshandle;

        emit ProfileUpdated(pshandle);
    }

    // Function to retrieve a profile by .PS handle
    function getProfileByPshandle(
        string memory pshandle
    ) public view returns (UserProfile memory) {
        return profilesByPshandle[pshandle];
    }

    // Function to retrieve a social media profile and its attestation by handle
    function getSocialMedia(
        string memory pshandle,
        string memory socialMedia
    ) public view returns (SocialMedia memory) {
        UserProfile storage profile = profilesByPshandle[pshandle];

        if (keccak256(bytes(socialMedia)) == keccak256(bytes("twitter"))) {
            return profile.twitter;
        } else if (
            keccak256(bytes(socialMedia)) == keccak256(bytes("instagram"))
        ) {
            return profile.instagram;
        } else if (
            keccak256(bytes(socialMedia)) == keccak256(bytes("facebook"))
        ) {
            return profile.facebook;
        } else if (
            keccak256(bytes(socialMedia)) == keccak256(bytes("medium"))
        ) {
            return profile.medium;
        } else if (
            keccak256(bytes(socialMedia)) == keccak256(bytes("threads"))
        ) {
            return profile.threads;
        } else if (
            keccak256(bytes(socialMedia)) == keccak256(bytes("farcaster"))
        ) {
            return profile.farcaster;
        } else if (
            keccak256(bytes(socialMedia)) == keccak256(bytes("mastodon"))
        ) {
            return profile.mastodon;
        } else {
            revert("Invalid social media type");
        }
    }

    // Function to retrieve a profile by any social media handle
    function getProfileBySocialMedia(
        string memory socialMediaHandle
    ) public view returns (UserProfile memory) {
        string memory pshandle = socialMediaToPshandle[socialMediaHandle];
        require(bytes(pshandle).length > 0, "Profile not found");
        return profilesByPshandle[pshandle];
    }
}
