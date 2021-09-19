// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import hre from "hardhat";
import { ethers, network } from "hardhat";

async function main() {
  await hre.run("compile");
  const networkName = network.name.toUpperCase();
  console.log("");
  console.log(`${networkName} selected`);
  console.log("");

  const [deployer] = await ethers.getSigners();

  const ActionNFT = await ethers.getContractFactory('ActionNFT');
  const nft = await ActionNFT.deploy(deployer.address, "10000000000000000");
  const txHash = nft.deployTransaction.hash;
  console.log(`https://${networkName.toLowerCase()}.etherscan.io/tx/${txHash}`);
  await nft.deployed();
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => {
    console.log("Deployment successful.");
    console.log("");
    process.exit(0);
  })
  .catch(error => {
    console.error(error);
    process.exit(1);
  })
