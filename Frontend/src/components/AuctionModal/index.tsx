/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { parseEther } from "ethers";
import { writeContract, getNetwork } from "@wagmi/core";
import { manageError, getContinentNftContract, getAuctionContract } from "../../utils/helper";

type AuctionModalT = {
  setShowAuctionModal: (bool: boolean) => any;
  nftIdToPutInAuction: number;
  handleOnAuctionSuccess: () => any;
};

const AuctionModal = ({
  setShowAuctionModal,
  nftIdToPutInAuction,
  handleOnAuctionSuccess,
}: AuctionModalT) => {
  const [auctionFormData, setAuctionFormData] = useState<{
    minPrice: number;
    auctionBidPeriod: number;
    bidIncreasePercentage: number;
  }>({
    minPrice: 0,
    auctionBidPeriod: 0,
    bidIncreasePercentage: 0,
  });

  const putInAuction = async () => {
    let isValidInput: boolean = true;

    const network = getNetwork()?.chain?.id
      ? getNetwork()?.chain?.id
      : "default";

    const CONTINENT_NFT = getContinentNftContract(network);
    const AUCTION = getAuctionContract(network);

    Object.values(auctionFormData).forEach((data) => {
      if (data <= 0) {
        isValidInput = false;
      }
    });

    if (isValidInput) {
      try {
        const approveNft = await writeContract({
          ...CONTINENT_NFT,
          functionName: "approve",
          args: [AUCTION.address, nftIdToPutInAuction],
        });

        if (approveNft && approveNft.hash) {
          const auctionCreateData = await writeContract({
            ...AUCTION,
            functionName: "createNewNftAuction",
            args: [
              CONTINENT_NFT.address,
              nftIdToPutInAuction,
              parseEther(`${auctionFormData.minPrice}`),
              auctionFormData.auctionBidPeriod * 60,
              auctionFormData.bidIncreasePercentage * 100,
              [],
              [],
            ],
          });

          if (auctionCreateData && auctionCreateData.hash) {
            handleOnAuctionSuccess();
            setShowAuctionModal(false);
          } else {
            throw "Something went wrong while creating auction.";
          }
        } else {
          throw "Something went wrong while approving token.";
        }
      } catch (e) {
        manageError(e);
      }
    } else {
      alert("Invalid form values.");
    }
  };

  const setFormData = async (key: string, e: any) => {
    setAuctionFormData({
      ...auctionFormData,
      [key]: e.target.value,
    });
  };

  return (
    <>
      <div className="flex justify-center items-center overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none">
        <div className="relative w-auto my-6 mx-auto max-w-3xl">
          <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
            <div className="flex items-start justify-between p-5 border-b border-solid border-gray-300 rounded-t ">
              <h3 className="text-3xl font=semibold">Auction Details</h3>
              <button
                type="button"
                className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                onClick={() => setShowAuctionModal(false)}
              >
                <svg
                  className="w-3 h-3"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 14 14"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                  />
                </svg>
                <span className="sr-only">Close modal</span>
              </button>
            </div>

            <div className="relative p-6 flex-auto">
              <form className="bg-gray-200 shadow-md rounded px-8 pt-6 pb-8 w-[500px]">
                <label className="block text-black text-sm font-bold mb-1 mt-10">
                  Minimum price
                </label>
                <input
                  type="number"
                  step={0.001}
                  min="0"
                  className="shadow appearance-none border rounded w-full py-2 px-1 text-black text-sm"
                  placeholder="Minimum bid price in ETH"
                  onChange={(e) => setFormData("minPrice", e)}
                />
                <label className="block text-black text-sm font-bold mb-1 mt-10">
                  Auction Bid period
                </label>
                <input
                  type="number"
                  step={1}
                  min="10"
                  className="shadow appearance-none border rounded w-full py-2 px-1 text-black text-sm"
                  placeholder="Time in minutes. This is the time the auction will wait for new bid after the highest bid, before ending the auction"
                  onChange={(e) => setFormData("auctionBidPeriod", e)}
                />
                <label className="block text-black text-sm font-bold mb-1 mt-10">
                  Bid increase percentage
                </label>
                <input
                  type="number"
                  step={0.01}
                  min="0"
                  className="shadow appearance-none border rounded w-full py-2 px-1 text-black text-sm"
                  placeholder="% at which the next bid should be increased to be the highest bid. Minimum values 0.01"
                  onChange={(e) => setFormData("bidIncreasePercentage", e)}
                />
              </form>
            </div>
            <div className="flex items-center justify-end p-6 border-t border-solid border-blueGray-200 rounded-b">
              <button
                type="button"
                className="text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700"
                onClick={() => setShowAuctionModal(false)}
              >
                Close
              </button>

              <button
                type="button"
                className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
                onClick={putInAuction}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AuctionModal;
