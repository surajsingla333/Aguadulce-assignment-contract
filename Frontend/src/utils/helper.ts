/* eslint-disable @typescript-eslint/no-explicit-any */
import { ContinentNft, ContinentNftAddress } from "../lib/ABI/Continent";
import { Auction, AuctionAddress } from "../lib/ABI/Auction";

import { formatEther } from "ethers";
import { BaseError, ContractFunctionRevertedError } from "viem";
import { AxiosError } from "axios";

export const findTokenId = (url: string) => url.split("/").pop()?.split(".")[0];

export const manageError = (err: any) => {
  if (err instanceof AxiosError) {
    if (err.response?.data.message) {
      alert(err.response?.data.message);
    }
  } else if (typeof err === "string") {
    alert(err);
  } else if (err instanceof BaseError) {
    const revertError = err.walk(
      (err) => err instanceof ContractFunctionRevertedError
    );
    if (revertError instanceof ContractFunctionRevertedError) {
      alert(revertError.reason);
    } else {
      alert(err.message);
    }
  } else {
    alert(err.message);
  }
};

export const checkIsValidAmount = (amount: number, data: any) => {
  const highestBid = Number(formatEther(data[4]));
  const minimumPrice = Number(formatEther(data[3]));
  //if the NFT is up for auction, the bid needs to be a % higher than the previous bid
  const bidIncreaseAmount = (highestBid * (10000 + Number(data[0]))) / 10000;

  return amount > minimumPrice && amount >= bidIncreaseAmount;
};

export const getDate = (date: any) => {
  const r = new Date(Number(`${Number(date)}000`));

  return `${r}`;
};

export const getContinentNftContract = (
  network: number | string | undefined
) => {
  return {
    address:
      network && ContinentNftAddress[network]
        ? ContinentNftAddress[network]
        : ContinentNftAddress["default"],
    abi: ContinentNft,
  };
};

export const getAuctionContract = (network: number | string | undefined) => {
  return {
    address:
      network && AuctionAddress[network]
        ? AuctionAddress[network]
        : AuctionAddress["default"],
    abi: Auction,
  };
};
