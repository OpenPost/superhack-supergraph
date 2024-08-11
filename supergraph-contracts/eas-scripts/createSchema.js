const { ethers } = require("ethers");
require('dotenv').config()

// Network and signer configuration
const providerUrl = "https://rpc-social-network-sqbzjhcjed.t.conduit.xyz"; // Your network URL
const privateKey = process.env.PRIVATE_KEY;

// Initialize ethers provider and signer
const provider = new ethers.JsonRpcProvider(providerUrl);
const signer = new ethers.Wallet(privateKey, provider);

// ABI for the SchemaRegistry contract
const schemaRegistryAbi = [
  "event Registered(bytes32 indexed uid, address indexed owner, string schema, address resolver, bool revocable)",
  "function register(string calldata schema, address resolver, bool revocable) external returns (bytes32)"
];

// SchemaRegistry contract address
const schemaRegistryContractAddress = "0xC2f871A2BF7B731d577D934f80bD823b3A322183"; // Your SchemaRegistry contract address
const schemaRegistry = new ethers.Contract(schemaRegistryContractAddress, schemaRegistryAbi, signer);

async function registerSchema() {
  try {
    const schema = "string pshandle, string socialMedia, string socialMediaHandle";
    const resolverAddress = "0x0000000000000000000000000000000000000000"; // No resolver
    const revocable = true;

    console.log("Registering schema...");
    const transaction = await schemaRegistry.register(schema, resolverAddress, revocable);
    const receipt = await transaction.wait();

    console.log("Transaction receipt:", transaction.receipt);

    

    // Assuming the event logs contain the correct event
    if (receipt && receipt.logs && receipt.logs.length > 0) {
      // You may need to adjust this if the structure is different
      const schemaUID = receipt.logs[0].topics[1]; // Accessing the indexed UID
      console.log(`Schema registered with UID: ${schemaUID}`);
    } else {
      console.log("No logs found in the transaction receipt.");
    }
  } catch (error) {
    console.error("Error registering schema:", error);
  }
}

// Execute the script
registerSchema();
