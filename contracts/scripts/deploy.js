const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const signers = await ethers.getSigners();
  if (signers.length === 0) {
    throw new Error("No deployer found. Please ensure PRIVATE_KEY is set in contracts/.env");
  }
  const deployer = signers[0];
  const network = await ethers.provider.getNetwork();

  console.log(`Deploying PayFi Protocol to ChainID: ${network.chainId}`);
  console.log(`Deployer Account: ${deployer.address}`);

  // 1. Deploy Registry
  const Registry = await ethers.getContractFactory("PayFiRegistry");
  const registry = await Registry.deploy();
  await registry.waitForDeployment();
  const registryAddr = await registry.getAddress();
  console.log(`PayFiRegistry: ${registryAddr}`);

  // 2. Deploy Executor
  const HSP_SETTLEMENT = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9"; // Testnet or Hardhat address
  const KYC_SBT = "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9"; // Testnet or Hardhat address
  const Executor = await ethers.getContractFactory("PayFiExecutor");
  const executor = await Executor.deploy(registryAddr, HSP_SETTLEMENT, KYC_SBT);
  await executor.waitForDeployment();
  const executorAddr = await executor.getAddress();
  console.log(`PayFiExecutor: ${executorAddr}`);

  // 3. Link executor to registry
  await registry.setExecutor(executorAddr);
  console.log("Executor linked to registry");

  // 4. Deploy Keeper
  const Keeper = await ethers.getContractFactory("PayFiKeeper");
  const keeper = await Keeper.deploy(registryAddr, executorAddr);
  await keeper.waitForDeployment();
  const keeperAddr = await keeper.getAddress();
  console.log(`PayFiKeeper: ${keeperAddr}`);

  // 5. Authorize keeper on executor
  await executor.setKeeper(keeperAddr);
  console.log("Keeper authorized on executor");

  console.log("\n=== Deployment complete ===");
  console.log(`Registry:  ${registryAddr}`);
  console.log(`Executor:  ${executorAddr}`);
  console.log(`Keeper:    ${keeperAddr}`);

  // 6. Export Addresses for Frontend (Preserving structure)
  const configPath = path.join(__dirname, "../../frontend/config/contracts.json");
  let fullConfig = { networks: {} };
  
  if (fs.existsSync(configPath)) {
    fullConfig = JSON.parse(fs.readFileSync(configPath, "utf8"));
  }

  const cid = network.chainId.toString();
  if (!fullConfig.networks[cid]) {
    fullConfig.networks[cid] = { 
      name: cid === "133" ? "HashKey Chain Testnet" : "Custom Network",
      rpc: network.url || "https://testnet.hsk.xyz",
      explorer: cid === "133" ? "https://testnet-explorer.hsk.xyz" : "",
      nativeToken: "HSK"
    };
  }

  fullConfig.networks[cid].contracts = {
    ...fullConfig.networks[cid].contracts,
    registry: registryAddr,
    executor: executorAddr,
    keeper: keeperAddr,
    hspSettlement: HSP_SETTLEMENT,
    kycSBT: KYC_SBT
  };

  fs.writeFileSync(configPath, JSON.stringify(fullConfig, null, 2));
  console.log(`Updated frontend config for ChainID ${cid}`);
}

main().catch(console.error);
