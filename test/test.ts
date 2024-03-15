import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { continentData } from "./fixtures/ContinentData";

function convertToEth(number: number) {
  return number * 10 ** 18;
}

describe("Continent", function () {
  async function deployAndMintContinent() {
    const signers = await ethers.getSigners();
    const owner = signers[0];

    const Continent = await ethers.getContractFactory("Continent");
    const continent = await upgrades.deployProxy(Continent, [owner.address]);

    await continent.waitForDeployment();
    console.log("Continent deployed to:", await continent.getAddress());

    for (let i = 1; i <= 7; i++) {
      await continent.safeMint(signers[i].address);
    }

    return { continent, owner, signers };
  }

  async function initialSetup() {
    const { continent, owner, signers } = await loadFixture(
      deployAndMintContinent
    );

    await continent.setTeamsFees(convertToEth(0.001));
    expect(await continent.teamsFees()).to.equal(convertToEth(0.001));

    expect(await continent.balanceOf(signers[1].address)).to.equal(1);

    await expect(continent.setCitizenTax(111)).to.be.reverted;

    for (let i = 1; i <= 7; i++) {
      const citizenTax = convertToEth(0.0001);
      await continent.connect(signers[i]).setCitizenTax(citizenTax);
      expect(await continent.citizenTaxForContinent(i)).to.equal(citizenTax);
    }
  }

  describe("Deploy and Mint", function () {
    it("Should deploy and mint correct amount of tokens", async () => {
      const { continent, owner, signers } = await loadFixture(
        deployAndMintContinent
      );

      expect(await continent.balanceOf(owner.address)).to.equal(0);
      expect(await continent.balanceOf(signers[1].address)).to.equal(1);
      expect(await continent.teamsFees()).to.equal(0);

      const continentId = 1;
      const tokenUri = await continent.tokenURI(continentId);

      let data = await fetch(tokenUri);
      data = await data.json();

      expect(JSON.stringify(data)).to.equal(
        JSON.stringify(continentData[continentId])
      );
    });

    it("Should set citizen and team fees", async () => {
      await initialSetup();
    });

    it("Signer 1 sending continent to Signer 6 and failing since signer 6 is already an owner", async () => {
      const { continent, signers } = await loadFixture(deployAndMintContinent);
      await initialSetup();

      await expect(continent.connect(signers[1]).transferContinent(signers[6]))
        .to.be.reverted;
    });

    it("Signer 1 sending continent to Signer 8 and send teams fees to owner", async () => {
      const { continent, owner, signers } = await loadFixture(
        deployAndMintContinent
      );
      await initialSetup();

      const teamsFees = await continent.teamsFees();

      const earlierOwnerBalance = await ethers.provider.getBalance(owner);
      const earlierSigner1Balance = await ethers.provider.getBalance(
        signers[1]
      );

      expect(await continent.balanceOf(signers[8].address)).to.equal(0);

      // reverting if send no amount
      await expect(continent.connect(signers[1]).transferContinent(signers[8]))
        .to.be.reverted;

      // reverting if send lesser amount
      await expect(
        continent
          .connect(signers[1])
          .transferContinent(signers[8], { value: teamsFees - 1n })
      ).to.be.reverted;

      await continent
        .connect(signers[1])
        .transferContinent(signers[8], { value: teamsFees });

      expect(await continent.balanceOf(signers[1].address)).to.equal(0);
      expect(await continent.balanceOf(signers[8].address)).to.equal(1);

      expect(await ethers.provider.getBalance(owner)).to.equal(
        earlierOwnerBalance + teamsFees
      );

      expect(await ethers.provider.getBalance(signers[1])).to.lessThan(
        earlierSigner1Balance - teamsFees
      );
    });

    it("Signer 8 becomes citizen of signer 1's continent -> Signer 2 transfers continent to Signer 8 and fails", async () => {
      const { continent, owner, signers } = await loadFixture(
        deployAndMintContinent
      );
      await initialSetup();

      // 8 becoming citizen
      const teamsFees = await continent.teamsFees();
      const citizenTaxForContinent1 = await continent.citizenTaxForContinent(1);

      const earlierOwnerBalance = await ethers.provider.getBalance(owner);
      const earlierSigner1Balance = await ethers.provider.getBalance(
        signers[1]
      );
      const earlierSigner8Balance = await ethers.provider.getBalance(
        signers[8]
      );

      // reverting if owner tries to be a citizen
      await expect(continent.connect(signers[2]).becomeCitizen(1)).to.be
        .reverted;

      // reverting if send no amount
      await expect(continent.connect(signers[8]).becomeCitizen(1)).to.be
        .reverted;

      // reverting if send lesser amount
      await expect(
        continent
          .connect(signers[8])
          .becomeCitizen(1, { value: teamsFees - 1n })
      ).to.be.reverted;

      // reverting if send more amount
      await expect(
        continent
          .connect(signers[8])
          .becomeCitizen(1, { value: citizenTaxForContinent1 - 1n })
      ).to.be.reverted;

      await continent
        .connect(signers[8])
        .becomeCitizen(1, { value: citizenTaxForContinent1 });

      // reverting if try to be citizen again
      await expect(
        continent
          .connect(signers[8])
          .becomeCitizen(1, { value: citizenTaxForContinent1 })
      ).to.be.reverted;

      expect(await continent.checkIsCitizenOfContinent(1, signers[8])).to.equal(
        true
      );

      expect(
        await continent.listOfContinentOfCitizenship(signers[8], 0)
      ).to.equal(1);

      await expect(continent.listOfContinentOfCitizenship(signers[8], 1)).to.be
        .reverted;

      expect(await continent.listOfCitizensOfContinent(1, 0)).to.equal(
        signers[8].address
      );

      await expect(continent.listOfCitizensOfContinent(1, 1)).to.be.reverted;

      expect(await ethers.provider.getBalance(owner)).to.equal(
        earlierOwnerBalance
      );

      expect(await ethers.provider.getBalance(signers[1])).to.equal(
        earlierSigner1Balance + citizenTaxForContinent1
      );

      expect(await ethers.provider.getBalance(signers[8])).to.lessThan(
        earlierSigner8Balance - citizenTaxForContinent1
      );

      // 2 trying to transfer continent to 8

      // transfer reverting because signer 8 is now a citizen
      await expect(
        continent
          .connect(signers[2])
          .transferContinent(signers[8], { value: teamsFees })
      ).to.be.reverted;
    });
  });
});
