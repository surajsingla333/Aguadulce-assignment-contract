const { ethers, upgrades } = require("hardhat");

async function main() {
  const signers = await ethers.getSigners();
  const [deployer] = signers;

  console.log({ deployer });

  const Continent = await ethers.getContractFactory("Continent");
  const continent = await upgrades.deployProxy(Continent, [deployer.address]);

  await continent.waitForDeployment();
  console.log("Continent deployed to:", await continent.getAddress());

  const Auction = await ethers.getContractFactory("Auction");
  const auction = await upgrades.deployProxy(Auction, [deployer.address]);

  await auction.waitForDeployment();
  console.log("Auction deployed to:", await auction.getAddress());

  // INITIAL SETUP
  const teamsFees = 0.001 * 10 ** 18;
  const citizenTax = 0.0001 * 10 ** 18;

  await continent.setTeamsFees(teamsFees);

  for (let i = 1; i <= 7; i++) {
    await continent.connect(signers[i]).setCitizenTax(citizenTax);
  }
}

main();
