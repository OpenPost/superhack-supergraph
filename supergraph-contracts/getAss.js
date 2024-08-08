import { EAS, SchemaEncoder } from "@ethereum-attestation-service/eas-sdk";
import { ethers } from "ethers";

// Network and signer configuration
const providerUrl = "https://rpc-social-network-sqbzjhcjed.t.conduit.xyz"; // Your network URL
const privateKey = "pk"; // Your private key

// Initialize ethers provider and signer
const provider = new ethers.JsonRpcProvider(providerUrl);
const signer = new ethers.Wallet(privateKey, provider);

const eas = new EAS("0x1bF54f52c2733d1a694F6a38Cf1bBE043F84571C");
eas.connect(provider);

const uid = "0x4db36b95daa258ba1deacc491f62a9b1759befa412f3e7ec7263750a4c2a72e7";

async function getAndDecodeAttestation() {
  // Get the attestation
  const attestation = await eas.getAttestation(uid);
  console.log("Attestation:", attestation);

  // Print the raw encoded data
  
  const rawData = attestation[9];
  console.log("Raw Encoded Data:", rawData);

  // Assuming the schema is "string name"
  const schemaEncoder = new SchemaEncoder("string name");

  console.log(schemaEncoder);
  
  // Decode the data
  const decodedData = schemaEncoder.decodeData(rawData);

  console.log("Decoded Attestation Data:");
  console.log(`Name: ${JSON.stringify(decodedData[0])}`); // Ensure this is accessing the correct index
}

// Execute the function
getAndDecodeAttestation();
