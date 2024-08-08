// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SocialProfileRegistry {
    struct UserProfile {
        string pshandle;
        string twitter;
        string instagram;
        string facebook;
        string medium;
        string threads;
        string farcaster;
        string mastodon;
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
    event VerificationRequested(string indexed pshandle, string socialMedia, bytes32 hash);

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
        bytes32 hash = keccak256(abi.encodePacked(otp, socialMedia));
        verificationRequests[socialMedia] = hash;
        emit VerificationRequested(pshandle, socialMedia, hash);
    }

    // Function for the user to complete the verification
    function completeVerification(
        string memory pshandle,
        string memory socialMedia,
        string memory otp,
        string memory socialMediaHandle
    ) public {
        bytes32 expectedHash = keccak256(abi.encodePacked(otp, socialMedia));
        require(verificationRequests[socialMedia] == expectedHash, "Invalid verification");

        UserProfile storage profile = profilesByPshandle[pshandle];
        if (keccak256(bytes(socialMedia)) == keccak256(bytes("twitter"))) {
            profile.twitter = socialMediaHandle;
        } else if (keccak256(bytes(socialMedia)) == keccak256(bytes("instagram"))) {
            profile.instagram = socialMediaHandle;
        } else if (keccak256(bytes(socialMedia)) == keccak256(bytes("facebook"))) {
            profile.facebook = socialMediaHandle;
        } else if (keccak256(bytes(socialMedia)) == keccak256(bytes("medium"))) {
            profile.medium = socialMediaHandle;
        } else if (keccak256(bytes(socialMedia)) == keccak256(bytes("threads"))) {
            profile.threads = socialMediaHandle;
        } else if (keccak256(bytes(socialMedia)) == keccak256(bytes("farcaster"))) {
            profile.farcaster = socialMediaHandle;
        } else if (keccak256(bytes(socialMedia)) == keccak256(bytes("mastodon"))) {
            profile.mastodon = socialMediaHandle;
        }

        socialMediaToPshandle[socialMediaHandle] = pshandle;
        delete verificationRequests[socialMedia];
        emit ProfileUpdated(pshandle);
    }

    // Function to set or update a user profile directly (without verification)
    function setUserProfile(
        string memory pshandle,
        string memory twitter,
        string memory instagram,
        string memory facebook,
        string memory medium,
        string memory threads,
        string memory farcaster,
        string memory mastodon
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
        if (bytes(twitter).length > 0) socialMediaToPshandle[twitter] = pshandle;
        if (bytes(instagram).length > 0) socialMediaToPshandle[instagram] = pshandle;
        if (bytes(facebook).length > 0) socialMediaToPshandle[facebook] = pshandle;
        if (bytes(medium).length > 0) socialMediaToPshandle[medium] = pshandle;
        if (bytes(threads).length > 0) socialMediaToPshandle[threads] = pshandle;
        if (bytes(farcaster).length > 0) socialMediaToPshandle[farcaster] = pshandle;
        if (bytes(mastodon).length > 0) socialMediaToPshandle[mastodon] = pshandle;
        
        emit ProfileUpdated(pshandle);
    }

    // Function to retrieve a profile by .PS handle
    function getProfileByPshandle(string memory pshandle) public view returns (UserProfile memory) {
        return profilesByPshandle[pshandle];
    }

    // Function to retrieve a profile by any social media handle
    function getProfileBySocialMedia(string memory socialMediaHandle) public view returns (UserProfile memory) {
        string memory pshandle = socialMediaToPshandle[socialMediaHandle];
        require(bytes(pshandle).length > 0, "Profile not found");
        return profilesByPshandle[pshandle];
    }
}
