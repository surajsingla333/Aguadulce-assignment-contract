const { ethers, upgrades } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log({deployer})

  const Continent = await ethers.getContractFactory("Continent");
  const continent = await upgrades.deployProxy(Continent, [deployer.address]);

  await continent.waitForDeployment();
  console.log("Continent deployed to:", await continent.getAddress());
}

main();
