/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { parseEther } from "ethers";
import { writeContract } from "@wagmi/core";

import { CONTINENT_NFT, AUCTION } from "../../utils/const";
import { manageError, checkIsValidAmount } from "../../utils/helper";

type BidModalT = {
  setShowBidModal: (bool: boolean) => any;
  nftDetails: any;
  handleOnBidSuccess: () => any;
};

const BidModal = ({
  setShowBidModal,
  nftDetails,
  handleOnBidSuccess,
}: BidModalT) => {
  const [bidAmount, setBidAmount] = useState<number>(0);

  const placeBid = async () => {
    const isValidInput = checkIsValidAmount(bidAmount, nftDetails.auction);

    if (isValidInput) {
      try {
        const makeBid = await writeContract({
          ...AUCTION,
          functionName: "makeBid",
          args: [CONTINENT_NFT.address, nftDetails.nft.tokenId],
          value: parseEther(`${bidAmount}`),
        });

        if (makeBid && makeBid.hash) {
          handleOnBidSuccess();
          setShowBidModal(false);
        } else {
          throw "Something went wrong while approving token.";
        }
      } catch (e) {
        manageError(e);
      }
    } else {
      alert("Invalid bid amount. Make a greater bid");
    }
  };

  const setFormData = async (e: any) => {
    setBidAmount(e.target.value);
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
                onClick={() => setShowBidModal(false)}
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
                  Bid amount
                </label>
                <input
                  type="number"
                  min="0"
                  className="shadow appearance-none border rounded w-full py-2 px-1 text-black text-sm"
                  placeholder="Bid amount in ETH"
                  onChange={setFormData}
                />
              </form>
            </div>
            <div className="flex items-center justify-end p-6 border-t border-solid border-blueGray-200 rounded-b">
              <button
                type="button"
                className="text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700"
                onClick={() => setShowBidModal(false)}
              >
                Close
              </button>

              <button
                type="button"
                className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
                onClick={placeBid}
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

export default BidModal;
