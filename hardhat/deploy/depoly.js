const hre = require("hardhat");
const VNFTDeploy =require('../artifacts/contracts/VulnerableNFT.sol/VulnerableNFT.json');
const NFTDeploy = require('../artifacts/contracts/NFTDrainer.sol/NFTDrainer.json');
const fs=require('fs');
const path=require('path');

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);
  const VulnerableNFT = await hre.ethers.getContractFactory("VulnerableNFT");
  const nft = await VulnerableNFT.deploy();
  await nft.waitForDeployment();
  console.log("NFT Contract deployed to:", nft.target);

  const NFTDrainer = await hre.ethers.getContractFactory("NFTDrainer");
  const drainer = await NFTDrainer.deploy();
  await drainer.waitForDeployment();
  console.log("Drainer Contract deployed here:", drainer.target);

  const deployerDetails={
    deployerAddress:deployer.address,
    nftAddress: nft.target,
    drainerAddress: drainer.target
  }
  const nftDetails={
    abi:VNFTDeploy.abi
  }

  const drainerDetails={
    abi:NFTDeploy.abi
  }

  try {
    fs.writeFileSync(path.join(__dirname,'../../frontend/abis/DeployersADD.json'),JSON.stringify(deployerDetails));
    fs.writeFileSync(path.join(__dirname,'../../frontend/abis/NFTDrainer.json'),JSON.stringify(drainerDetails));
    fs.writeFileSync(path.join(__dirname,'../../frontend/abis/VulnerableNFT.json'),JSON.stringify(nftDetails));

  } catch (error) {
    console.error('Error writing contract details to file:', error);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});