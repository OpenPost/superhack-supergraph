
import { EAS, SchemaEncoder } from "@ethereum-attestation-service/eas-sdk";
import { ethers } from "ethers";
// require('dotenv').config()

export async function createAttestation (pshandle: any  , socialMedia: string, socialMediaHandle: string) {

  const providerUrl = "https://rpc-social-network-sqbzjhcjed.t.conduit.xyz"; // Your network URL
  const privateKey = process.env.PRIVATE_KEY

  // Initialize ethers provider and signer
  const provider = new ethers.JsonRpcProvider(providerUrl);
  const signer = new ethers.Wallet(`${privateKey}`, provider);

  const eas = new EAS('0x1bF54f52c2733d1a694F6a38Cf1bBE043F84571C');
  eas.connect(signer);

  const schema = "string pshandlev2, string socialMedia, string socialMediaHandle";
  const schemaEncoder = new SchemaEncoder(schema);

  const encodedData = schemaEncoder.encodeData([
    { name: "pshandlev2", value: pshandle, type: "string" },
    { name: "socialMedia", value: socialMedia, type: "string" },
    { name: "socialMediaHandle", value: socialMediaHandle, type: "string" }
  ]);
  //examole uid 
  // 0xaf86390ce05c6c4e5b8f29bff69b67c9d5459b39908b8e118f781adb1ea1208d
  const schemaUID = "0x1cbae17f248d3e1001e37c5f4218e8e7c9f48f83ea41929484b2de9841cad8a1";

  const tx = await eas.attest({
    schema: schemaUID,
    data: {
      recipient: "0xFD50b031E778fAb33DfD2Fc3Ca66a1EeF0652165",
      expirationTime: ethers.toBigInt(0),
      revocable: true,
      data: encodedData,
    },
  });

  const newAttestationUID = await tx.wait();
  console.log("New attestation UID:", newAttestationUID);

  return newAttestationUID
}
// Initialize SchemaEncoder with the schema string
