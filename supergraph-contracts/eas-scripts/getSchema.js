import { SchemaRegistry } from "@ethereum-attestation-service/eas-sdk";
import { ethers } from "ethers";

const providerUrl = "https://rpc-social-network-sqbzjhcjed.t.conduit.xyz"; // Your network URL
const privateKey = "pk"; // Your private key

// Initialize ethers provider and signer
const provider = new ethers.JsonRpcProvider(providerUrl);
const signer = new ethers.Wallet(privateKey, provider);


const schemaRegistryContractAddress = "0xC2f871A2BF7B731d577D934f80bD823b3A322183"; // Your SchemaRegistry contract address
const schemaRegistry = new SchemaRegistry(schemaRegistryContractAddress);

schemaRegistry.connect(provider);

const schemaUID = "0x1ac12809313ba1aff3f4eb4e13c4814165a5d9d13b05ac252e4bb05c612227d7";

const schemaRecord = await schemaRegistry.getSchema({ uid: schemaUID });

console.log(schemaRecord);

