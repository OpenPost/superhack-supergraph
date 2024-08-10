
import { ethers } from "ethers";
import { ByteArray, BytesToHexOpts } from "viem";

// import dotenv from "dotenv";

// dotenv.config();

const providerUrl = "https://rpc-social-network-sqbzjhcjed.t.conduit.xyz";
const privateKey = process.env.PRIVATE_KEY || ''; // Ensure private key is available
const contractAddress = "0xAd35000D40971c561277A0B3FEf3599247B1181B";

const contractAbi = [
    "function requestVerification(string pshandle, string socialMedia, string otp) external",
    "function completeVerification(string pshandle, string socialMedia, string otp, string socialMediaHandle, bytes32 attestationUID) external",
    "function getProfileByPshandle(string pshandle) public view returns (tuple(string pshandle, tuple(string handle, bytes32 attestationUID) twitter, tuple(string handle, bytes32 attestationUID) instagram, tuple(string handle, bytes32 attestationUID) facebook, tuple(string handle, bytes32 attestationUID) medium, tuple(string handle, bytes32 attestationUID) threads, tuple(string handle, bytes32 attestationUID) farcaster, tuple(string handle, bytes32 attestationUID) mastodon))",
    "function setUserProfile(string pshandle, tuple(string, bytes32) twitter, tuple(string, bytes32) instagram, tuple(string, bytes32) facebook, tuple(string, bytes32) medium, tuple(string, bytes32) threads, tuple(string, bytes32) farcaster, tuple(string, bytes32) mastodon) public",
  ];
  
const provider = new ethers.JsonRpcProvider(providerUrl);
const signer = new ethers.Wallet(`${privateKey}`, provider);
const contract = new ethers.Contract(contractAddress, contractAbi, signer);

function hashString(input: string): string {
    const hash = ethers.keccak256(ethers.toUtf8Bytes(input));
    console.log(hash);
    return hash;
}

export async function setUserProfile(
    pshandle: string,
    twitter: string,
    instagram: string,
    facebook: string,
    medium: string,
    threads: string,
    farcaster: string,
    mastodon: string
) {
    try {
        console.log(`Setting user profile for ${pshandle}`);
        const tx = await contract.setUserProfile(
            pshandle,
            twitter,
            instagram,
            facebook,
            medium,
            threads,
            farcaster,
            mastodon
        );
        await tx.wait();
        console.log(`Profile set. Transaction Hash: ${tx.hash}`);
    } catch (error) {
        console.error("Error setting user profile:", error);
    }
}

export async function requestVerification(
    pshandle: string,
    socialMedia: string,
    otp: string
) {
    try {
        let newOtp = hashString(otp);
        console.log(`Requesting verification for ${pshandle} on ${socialMedia} with OTP: ${newOtp}`);
        const tx = await contract.requestVerification(pshandle, socialMedia, newOtp);
        await tx.wait();
        console.log(`Verification requested. Transaction Hash: ${tx.hash}`);

        return { success: true, txn: tx.hash }

    } catch (error) {
        console.error("Error requesting verification:", error);
    }
}

export async function completeVerification(
    pshandle: string,
    socialMedia: string,
    otp: string,
    newSocialMediaHandle: string,
    attestationUID: any
) {
    try {
        let newOtp = hashString(otp);
        console.log(`Completing verification for ${pshandle} on ${socialMedia} with handle: ${newSocialMediaHandle}`);
        const tx = await contract.completeVerification(pshandle, socialMedia, newOtp, newSocialMediaHandle,  ethers.hexlify(attestationUID));
        await tx.wait();
        console.log(`Verification completed. Updated ${socialMedia} to ${newSocialMediaHandle}. Transaction Hash: ${tx.hash}`);

        return { success: true, txn: tx.hash }
    } catch (error) {
        console.error("Error completing verification:", error);
    }
}



export async function checkVerification(pshandle: string | undefined) {
    try {
        console.log("RUNNING");
        console.log("pshandle", pshandle);
        const profile = await contract.getProfileByPshandle(pshandle);
        console.log("prfile checkver",  profile);
        return { profile, isProfile: true }
    } catch (error) {
        console.log('from error');

        return { profile:"no profile", isProfile: false }
    }
}