const { ethers } = require("ethers");
require('dotenv').config()

// Set up your environment variables or replace these with your actual values
const providerUrl = "https://rpc-social-network-sqbzjhcjed.t.conduit.xyz";
const privateKey = process.env.PRIVATE_KEY;
const contractAddress = "0x0Ed393BA7E62dFe710afC7837383eC3166861CcE"; // Replace with the deployed contract address

// Contract ABI
const contractAbi = [
    "function requestVerification(string pshandle, string socialMedia, string otp) external",
    "function completeVerification(string pshandle, string socialMedia, string otp, string socialMediaHandle) external",
    "function getProfileByPshandle(string pshandle) public view returns (tuple(string,string,string,string,string,string,string,string))",
    "function setUserProfile(string pshandle, string twitter, string instagram, string facebook, string medium, string threads, string farcaster, string mastodon) public"
];

// Initialize ethers provider and signer
const provider = new ethers.JsonRpcProvider(providerUrl);
const signer = new ethers.Wallet(privateKey, provider);

// Initialize contract instance
const contract = new ethers.Contract(contractAddress, contractAbi, signer);

// Function to hash a string
function hashString(input) {

    // import contract 

    //Sets the hash which is resolved by the secert
    const hash = ethers.keccak256(ethers.toUtf8Bytes(input));
    //Determine who is the atomic swap recipient
    console.log(hash);

    return hash;


}




// Function to set user profile
async function setUserProfile(pshandle, twitter, instagram, facebook, medium, threads, farcaster, mastodon) {
    try {
        console.log(`Setting user profile for ${pshandle}`);
        const tx = await contract.setUserProfile(pshandle, twitter, instagram, facebook, medium, threads, farcaster, mastodon);
        await tx.wait();
        console.log(`Profile set. Transaction Hash: ${tx.hash}`);
    } catch (error) {
        console.error("Error setting user profile:", error);
    }
}

// Function to request verification
async function requestVerification(pshandle, socialMedia, otp) {
    try {
        let newOtp = hashString(otp)
        console.log(`Requesting verification for ${pshandle} on ${socialMedia} with OTP: ${newOtp}`);
        const tx = await contract.requestVerification(pshandle, socialMedia, newOtp);
        await tx.wait();
        console.log(`Verification requested. Transaction Hash: ${tx.hash}`);
    } catch (error) {
        console.error("Error requesting verification:", error);
    }
}

// Function to complete verification
async function completeVerification(pshandle, socialMedia, otp, newSocialMediaHandle) {
    try {
        let newOtp = hashString(otp)
        console.log(`Completing verification for ${pshandle} on ${socialMedia} with handle: ${newSocialMediaHandle}`);
        const tx = await contract.completeVerification(pshandle, socialMedia, newOtp, newSocialMediaHandle);
        await tx.wait();
        console.log(`Verification completed. Updated ${socialMedia} to ${newSocialMediaHandle}. Transaction Hash: ${tx.hash}`);
    } catch (error) {
        console.error("Error completing verification:", error);
    }
}

// Function to check if verification is completed
async function checkVerification(pshandle) {
    try {
        const profile = await contract.getProfileByPshandle(pshandle);
        console.log("User Profile:", profile);
    } catch (error) {
        console.error("Error fetching profile:", error);
    }
}

// Example usage
const pshandle = "saeed5";
const socialMedia = "facebook";
const otp = "unique-otp"; // Securely generate this in a real application
const newFacebookHandle = "newFacebook3";
const attestationUID = "UID FROM EAS ! "
// Set initial profile
// Set initial profile
setUserProfile(
    pshandle, 
    { handle: "tsaeed", attestationUID: attestationUID },
    { handle: "igSaeed", attestationUID: attestationUID },
    { handle: "fbSaeed", attestationUID: attestationUID },
    { handle: "mSaeed", attestationUID: attestationUID },
    { handle: "tSaeed", attestationUID: attestationUID },
    { handle: "fSaeed", attestationUID: attestationUID },
    { handle: "mSaeed", attestationUID: attestationUID }
)
    .then(() => requestVerification(pshandle, socialMedia, otp))
    .then(() => completeVerification(pshandle, socialMedia, otp, newFacebookHandle, attestationUID))
    .then(() => checkVerification(pshandle));
