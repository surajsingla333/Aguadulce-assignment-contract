/* eslint-disable @typescript-eslint/no-explicit-any */
import { ContinentNft, ContinentNftAddress } from "../lib/ABI/Continent";
import { Auction, AuctionAddress } from "../lib/ABI/Auction";

export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

export const CONTINENT_NFT: any = {
  address: ContinentNftAddress,
  abi: ContinentNft,
};

export const AUCTION: any = {
  address: AuctionAddress,
  abi: Auction,
};
