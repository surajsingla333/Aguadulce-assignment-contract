/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { formatEther, parseEther } from "ethers";
import { writeContract, readContract, getNetwork } from "@wagmi/core";
import axios from "axios";
import { manageError, getContinentNftContract } from "../../utils/helper";

type CitizenshipModalT = {
  setShowCitizenshipModal: (bool: boolean) => any;
  nftId: number;
  handleOnCitizenshipSuccess: () => any;
};

const CitizenshipModal = ({
  setShowCitizenshipModal,
  nftId,
  handleOnCitizenshipSuccess,
}: CitizenshipModalT) => {
  const [tax, setTax] = useState<number>(0);

  const becomeCitizen = async () => {
    try {
      const network = getNetwork()?.chain?.id
        ? getNetwork()?.chain?.id
        : "default";

      const CONTINENT_NFT = getContinentNftContract(network);

      const becomeCitizenCall = await writeContract({
        ...CONTINENT_NFT,
        functionName: "becomeCitizen",
        args: [nftId],
        value: parseEther(`${tax}`),
      });

      if (becomeCitizenCall && becomeCitizenCall.hash) {
        handleOnCitizenshipSuccess();
        setShowCitizenshipModal(false);
      } else {
        throw "Something went wrong while creating auction.";
      }
    } catch (e) {
      manageError(e);
    }
  };

  const makeOtherAccountACitizen = async () => {
    try {
      const becomeCitizenData = await axios.post(
        `${import.meta.env.VITE_BACKEND_BASE_URL}/become-citizen`,
        {
          networkId: getNetwork()?.chain?.id,
          continentId: nftId,
          value: tax,
        },
        {
          headers: {
            withCredentials: false,
          },
        }
      );

      const { data } = becomeCitizenData.data;
      if (data) {
        handleOnCitizenshipSuccess();
        setShowCitizenshipModal(false);
      } else {
        throw "Something went wrong while creating auction.";
      }
    } catch (e: any) {
      manageError(e);
    }
  };

  const getCitizenShipTax = async () => {
    try {

      const network = getNetwork()?.chain?.id
        ? getNetwork()?.chain?.id
        : "default";

      const CONTINENT_NFT = getContinentNftContract(network);

      const citizenShipTax = await readContract({
        ...CONTINENT_NFT,
        functionName: "citizenTaxForContinent",
        args: [nftId],
      });

      setTax(Number(formatEther(`${citizenShipTax}`)));
    } catch (e) {
      manageError(e);
    }
  };
  useEffect(() => {
    getCitizenShipTax();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nftId]);

  return (
    <>
      <div className="flex justify-center items-center overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none">
        <div className="relative w-auto my-6 mx-auto max-w-3xl">
          <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
            <div className="flex items-start justify-between p-5 border-b border-solid border-gray-300 rounded-t ">
              <h3 className="text-3xl font=semibold">Citizenship Details</h3>
              <button
                type="button"
                className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                onClick={() => setShowCitizenshipModal(false)}
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
              <div>You will need to pay a Citizenship tax of {tax}</div>
            </div>
            <div className="flex items-center justify-end p-6 border-t border-solid border-blueGray-200 rounded-b">
              <button
                type="button"
                className="text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700"
                onClick={() => setShowCitizenshipModal(false)}
              >
                Close
              </button>

              <button
                type="button"
                className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
                onClick={becomeCitizen}
              >
                Submit
              </button>

              <button
                type="button"
                className="text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700"
                onClick={makeOtherAccountACitizen}
              >
                Make other user a citizen
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CitizenshipModal;
