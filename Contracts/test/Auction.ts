const { expect } = require("chai");

const { BigNumber } = require("ethers");
const { network } = require("hardhat");

const minPrice = 10000;
const newPrice = 15000;
const buyNowPrice = 100000;
const tokenBidAmount = 25000;
const tokenAmount = 50000;
const zeroAddress = "0x0000000000000000000000000000000000000000";
const zeroERC20Tokens = 0;
const emptyFeeRecipients: any = [];
const emptyFeePercentages: any = [];

const ContinentTeamFees = 0.001;
const CitizenTax = 0.0001;

function convertToEth(number: number) {
  return number * 10 ** 18;
}

// Deploy and create a mock erc721 contract.
// Test end to end auction
describe("End to end auction tests", function () {
  let ERC721: any;
  let erc721: any;
  let NFTAuction: any;
  let nftAuction: any;
  let contractOwner: any;
  let bidIncreasePercentage: any;
  let auctionBidPeriod: any;
  let signers: any;

  let auctionContractAddress: any;
  let nftContractAddress: any;

  //deploy Continent and auction contract and do initial setup for Continent
  beforeEach(async function () {
    ERC721 = await ethers.getContractFactory("Continent");
    NFTAuction = await ethers.getContractFactory("Auction");

    signers = await ethers.getSigners();
    [contractOwner] = signers;

    erc721 = await upgrades.deployProxy(ERC721, [contractOwner.address]);
    nftAuction = await upgrades.deployProxy(NFTAuction, [
      contractOwner.address,
    ]);

    await erc721.waitForDeployment();
    await nftAuction.waitForDeployment();

    nftContractAddress = await erc721.getAddress();
    auctionContractAddress = await nftAuction.getAddress();

    console.log("Continent deployed to:", nftContractAddress);
    console.log("Auction deployed to:", auctionContractAddress);

    for (let i = 1; i <= 7; i++) {
      await erc721.safeMint(signers[i].address);
    }

    await erc721.setTeamsFees(convertToEth(ContinentTeamFees));
    expect(await erc721.teamsFees()).to.equal(convertToEth(ContinentTeamFees));

    expect(await erc721.balanceOf(signers[1].address)).to.equal(1);

    await expect(erc721.setCitizenTax(111)).to.be.reverted;

    for (let i = 1; i <= 7; i++) {
      const citizenTax = convertToEth(CitizenTax);
      await erc721.connect(signers[i]).setCitizenTax(citizenTax);
      expect(await erc721.citizenTaxForContinent(i)).to.equal(citizenTax);
    }
  });

  describe("Custom auction for continent 1 end to end", async function () {
    const tokenId = 1;
    bidIncreasePercentage = 2000;
    auctionBidPeriod = 106400;

    beforeEach(async function () {
      await erc721
        .connect(signers[tokenId])
        .approve(auctionContractAddress, tokenId);

      await nftAuction
        .connect(signers[tokenId])
        .createNewNftAuction(
          nftContractAddress,
          tokenId,
          minPrice,
          auctionBidPeriod,
          bidIncreasePercentage,
          emptyFeeRecipients,
          emptyFeePercentages
        );
    });

    async function basicAuctionFlow(sender: any, user2: any, user3: any) {
      nftAuction.connect(user2).makeBid(nftContractAddress, tokenId, {
        value: minPrice,
      });

      const bidIncreaseByMinPercentage =
        (minPrice * (10000 + bidIncreasePercentage)) / 10000;
      await network.provider.send("evm_increaseTime", [43200]);

      await nftAuction.connect(user3).makeBid(nftContractAddress, tokenId, {
        value: bidIncreaseByMinPercentage,
      });

      await expect(
        nftAuction
          .connect(sender)
          .updateMinimumPrice(nftContractAddress, tokenId, newPrice)
      ).to.be.revertedWith("The auction has a valid bid made");

      await network.provider.send("evm_increaseTime", [86000]);
      const bidIncreaseByMinPercentage2 =
        (bidIncreaseByMinPercentage * (10000 + bidIncreasePercentage)) / 10000;
      await nftAuction.connect(user2).makeBid(nftContractAddress, tokenId, {
        value: bidIncreaseByMinPercentage2,
      });
      await network.provider.send("evm_increaseTime", [86001]);
      const bidIncreaseByMinPercentage3 =
        (bidIncreaseByMinPercentage2 * (10000 + bidIncreasePercentage)) / 10000;
      await nftAuction.connect(user3).makeBid(nftContractAddress, tokenId, {
        value: bidIncreaseByMinPercentage3,
      });
      //should not be able to settle auction yet
      await expect(
        nftAuction.connect(user3).settleAuction(nftContractAddress, tokenId)
      ).to.be.revertedWith("Auction is not yet over");
      await network.provider.send("evm_increaseTime", [auctionBidPeriod + 1]);
      //auction has ended

      const bidIncreaseByMinPercentage4 =
        (bidIncreaseByMinPercentage3 * (10000 + bidIncreasePercentage)) / 10000;
      await expect(
        nftAuction.connect(user2).makeBid(nftContractAddress, tokenId, {
          value: bidIncreaseByMinPercentage4,
        })
      ).to.be.revertedWith("Auction has ended");
    }

    it("should allow multiple bids and conclude auction after end period but the end transaction will fail", async function () {
      await basicAuctionFlow(signers[1], signers[2], signers[3]);

      //   this will also fail because signer 3 already has a continent
      await expect(
        nftAuction
          .connect(signers[3])
          .settleAuction(nftContractAddress, tokenId)
      ).to.be.revertedWith("Address already own a continent.");

      //   still same owner
      expect(await erc721.ownerOf(tokenId)).to.equal(signers[1].address);
    });

    it("should allow multiple bids and conclude auction after end period and NFT will be transferred", async function () {
      await basicAuctionFlow(signers[1], signers[2], signers[8]);

      //   this will also fail because signer 3 already has a continent
      await nftAuction
        .connect(signers[8])
        .settleAuction(nftContractAddress, tokenId);

      expect(await erc721.ownerOf(tokenId)).to.equal(signers[8].address);

      expect(await erc721.ownerContinentTokenId(signers[1].address)).to.equal(
        0
      );
      expect(await erc721.ownerContinentTokenId(signers[8].address)).to.equal(
        1
      );
    });
  });

  describe("Early bid auction end to end", async function () {
    const tokenId = 1;
    bidIncreasePercentage = 2000;
    auctionBidPeriod = 106400;
    beforeEach(async function () {
      await erc721
        .connect(signers[tokenId])
        .approve(auctionContractAddress, tokenId);

      await nftAuction
        .connect(signers[2])
        .makeBid(nftContractAddress, tokenId, {
          value: minPrice - 1,
        });
    });

    it("should allow owner to create auction which concludes after multiple bids", async function () {
      await nftAuction
        .connect(signers[1])
        .createNewNftAuction(
          nftContractAddress,
          tokenId,
          minPrice,
          auctionBidPeriod,
          bidIncreasePercentage,
          emptyFeeRecipients,
          emptyFeePercentages
        );

      await expect(
        nftAuction.connect(signers[2]).makeBid(nftContractAddress, tokenId, {
          value: minPrice,
        })
      ).to.be.revertedWith("Not enough funds to bid on NFT");

      const bidIncreaseByMinPercentage =
        (minPrice * (10000 + bidIncreasePercentage)) / 10000;
      await network.provider.send("evm_increaseTime", [43200]);
      await nftAuction
        .connect(signers[8])
        .makeBid(nftContractAddress, tokenId, {
          value: bidIncreaseByMinPercentage,
        });
      await network.provider.send("evm_increaseTime", [86000]);
      const bidIncreaseByMinPercentage2 =
        (bidIncreaseByMinPercentage * (10000 + bidIncreasePercentage)) / 10000;
      await nftAuction
        .connect(signers[2])
        .makeBid(nftContractAddress, tokenId, {
          value: bidIncreaseByMinPercentage2,
        });
      await network.provider.send("evm_increaseTime", [86001]);
      const bidIncreaseByMinPercentage3 =
        (bidIncreaseByMinPercentage2 * (10000 + bidIncreasePercentage)) / 10000;
      await nftAuction
        .connect(signers[8])
        .makeBid(nftContractAddress, tokenId, {
          value: bidIncreaseByMinPercentage3,
        });
      //should not be able to settle auction yet
      await expect(
        nftAuction
          .connect(signers[8])
          .settleAuction(nftContractAddress, tokenId)
      ).to.be.revertedWith("Auction is not yet over");
      await network.provider.send("evm_increaseTime", [auctionBidPeriod + 1]);
      //auction has ended
      await nftAuction
        .connect(signers[8])
        .settleAuction(nftContractAddress, tokenId);
      expect(await erc721.ownerOf(tokenId)).to.equal(signers[8].address);
    });
  });
});
