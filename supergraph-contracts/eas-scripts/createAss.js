import { EAS, SchemaEncoder } from "@ethereum-attestation-service/eas-sdk";
import { ethers } from "ethers";
require('dotenv').config()


const providerUrl = "https://rpc-social-network-sqbzjhcjed.t.conduit.xyz"; // Your network URL
const privateKey = process.env.PRIVATE_KEY;

// Initialize ethers provider and signer
const provider = new ethers.JsonRpcProvider(providerUrl);
const signer = new ethers.Wallet(privateKey, provider);

const eas = new EAS('0x1bF54f52c2733d1a694F6a38Cf1bBE043F84571C');
eas.connect(signer);

// Initialize SchemaEncoder with the schema string
const schemaEncoder = new SchemaEncoder("string socialMedia,string pshHandle");

const encodedData = schemaEncoder.encodeData([
  { name: "name4", value: "ely", type: "string" },
]);

const schemaUID = "0x1ac12809313ba1aff3f4eb4e13c4814165a5d9d13b05ac252e4bb05c612227d7";


const tx = await eas.attest({
  schema: schemaUID,
  data: {
    recipient: "0xFD50b031E778fAb33DfD2Fc3Ca66a1EeF0652165",
    expirationTime: 0,
    revocable: true, // Be aware that if your schema is not revocable, this MUST be false
    data: encodedData,
  },
});

const newAttestationUID = await tx.wait();

console.log("New attestation UID:", newAttestationUID);