/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { useNavigate } from "react-router-dom";
import { readContract, readContracts, writeContract } from "@wagmi/core";
import {formatEther} from "ethers"

import { CONTINENT_NFT, ZERO_ADDRESS, AUCTION } from "../../utils/const";
import { findTokenId, manageError } from "../../utils/helper";

import Loader from "../../components/Loader";
import BidModal from "../..//components/BidModal";

const AuctionComponent = () => {
  const [showBidModal, setShowBidModal] = useState(false);
  const [tokenForBid, setTokenForBid] = useState<any>({});
  const [ownerOf, setOwnerOf] = useState<number>(0);
  const [isEmptyAuction, setIsEmptyAuction] = useState(true);
  const [auctionNftData, setAuctionNftData] = useState<any>();

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const { isConnected, address } = useAccount();
  const navigate = useNavigate();

  const resetState = () => {
    setTokenForBid({});
    setOwnerOf(0);
    setIsEmptyAuction(true);
    setAuctionNftData({});
  };
  const getAuctionData = async () => {
    setIsLoading(true);

    try {
      const contracts = [];

      for (let i = 1; i <= 7; i++) {
        contracts.push({
          ...AUCTION,
          functionName: "nftContractAuctions",
          args: [CONTINENT_NFT.address, i],
        });
      }

      const readAuctionData = await readContracts({
        contracts,
      });

      console.log({ readAuctionData });

      const auctionLiveNft: any = {};
      const nftContracts: any = [];

      for (let i = 0; i < readAuctionData.length; i += 1) {
        if (readAuctionData[i].status === "success") {
          console.log("SFASF ", readAuctionData[i].result);
          const res: any = readAuctionData[i].result;
          if (res.filter((d: any) => d === ZERO_ADDRESS).length !== 2) {
            auctionLiveNft[`${i + 1}`] = { auction: res };

            nftContracts.push({
              ...CONTINENT_NFT,
              functionName: "tokenURI",
              args: [i + 1],
            });
          }
        }
      }

      if (Object.keys(auctionLiveNft).length && nftContracts.length) {
        setIsEmptyAuction(false);

        const readNftData = await readContracts({
          contracts: nftContracts,
        });

        console.log({ readNftData });

        for (let i = 0; i < readNftData.length; i++) {
          if (readNftData[i].status === "success") {
            const tokenId = findTokenId(`${readNftData[i]?.result}`);
            const tokenDetails = await fetch(`${readNftData[i]?.result}`);
            const tokenData: any = await tokenDetails.json();

            auctionLiveNft[`${tokenId}`] = {
              ...auctionLiveNft[`${tokenId}`],
              nft: { ...tokenData, tokenId },
            };
          }
        }

        console.log({ auctionLiveNft });

        setAuctionNftData(auctionLiveNft);
      } else {
        setIsEmptyAuction(true);
      }
    } catch (e) {
      manageError(e);
    }
    setIsLoading(false);
  };

  const checkUserStatus = async () => {
    try {
      const continentId = await readContract({
        ...CONTINENT_NFT,
        functionName: "ownerContinentTokenId",
        args: [address],
      });

      if (continentId) setOwnerOf(Number(continentId));
    } catch (e) {
      manageError(e);
    }
  };

  useEffect(() => {
    if (isConnected) {
      handleOnBidSuccess();
    } else {
      navigate("/");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, address]);

  const settleAuction = async (tokenId: number) => {
    try {
      const AuctionDataTemp = await writeContract({
        ...AUCTION,
        functionName: "settleAuction",
        args: [CONTINENT_NFT.address, tokenId],
      });

      console.log("AuctionDataTemp", AuctionDataTemp);
    } catch (err) {
      manageError(err);
    }
  };

  const placeBid = async (token: any) => {
    setShowBidModal(true);
    setTokenForBid(token);
  };

  const handleOnBidSuccess = async () => {
    resetState();
    getAuctionData();
    checkUserStatus();
  };

  return (
    <div className=" gap-5 h-screen justify-center items-center">
      {isLoading ? (
        <Loader />
      ) : isEmptyAuction ? (
        <div>
          <h1 className="lg:text-6xl mb-4 text-4xl">No active auction</h1>
        </div>
      ) : (
        <>
          {auctionNftData && Object.keys(auctionNftData).length ? (
            Object.keys(auctionNftData).map((nft) => {
              const tokenData = auctionNftData[nft].nft;
              const auctionData = auctionNftData[nft].auction;

              return (
                <div className="flex gap-4 justify-center items-center border-b border-2 m-4 p-8 rounded-lg">
                  <div>
                    <h1 className="lg:text-6xl mb-4 text-4xl">Nft Details</h1>
                    <div>
                      <img src={tokenData?.image} className="max-w-[500px]" />
                    </div>

                    {Object.keys(tokenData).map((d: string) => {
                      if (d === "image") return <></>;
                      return (
                        <div>
                          {d}: <span>{tokenData[d]}</span>
                        </div>
                      );
                    })}
                  </div>

                  <div>
                    <h1 className="lg:text-6xl mb-4 text-4xl mt-20">
                      Auction Details
                    </h1>

                    <div>
                      <div>Auction is ongoing</div>
                      <h2 className="text-xl font-bold dark:text-white">
                        Current highest bid details
                      </h2>
                      <div>Bidder: {auctionData[5]}</div>
                      <div>Bid amount: {formatEther(auctionData[4])}</div>

                      <div>
                        <button
                          type="button"
                          className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
                          onClick={() => settleAuction(tokenData.tokenId)}
                        >
                          Accept bid and end auction
                        </button>

                        {tokenData.tokenId != ownerOf && (
                          <button
                            type="button"
                            className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
                            onClick={() => placeBid(auctionNftData[nft])}
                          >
                            Place a bid
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div>
              <h1 className="lg:text-6xl mb-4 text-4xl">No active auction</h1>
            </div>
          )}
        </>
      )}

      {showBidModal ? (
        <BidModal
          setShowBidModal={setShowBidModal}
          nftDetails={tokenForBid}
          handleOnBidSuccess={handleOnBidSuccess}
        />
      ) : null}
    </div>
  );
};

export default AuctionComponent;
