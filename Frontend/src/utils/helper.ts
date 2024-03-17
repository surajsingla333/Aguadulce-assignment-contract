/* eslint-disable @typescript-eslint/no-explicit-any */
import { formatEther } from "ethers";
import { BaseError, ContractFunctionRevertedError } from "viem";

export const findTokenId = (url: string) => url.split("/").pop()?.split(".")[0];

export const manageError = (err: any) => {
  console.log({ err });
  if (typeof err === "string") {
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
  console.log({highestBid, minimumPrice, data})
  //if the NFT is up for auction, the bid needs to be a % higher than the previous bid
  const bidIncreaseAmount = (highestBid * (10000 + Number(data[0]))) / 10000;
  console.log({bidIncreaseAmount}, amount)
  return amount > minimumPrice && amount >= bidIncreaseAmount;
};
