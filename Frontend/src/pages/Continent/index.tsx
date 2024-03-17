/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { useNavigate } from "react-router-dom";
import { readContract, readContracts } from "@wagmi/core";

import CitizenshipModal from "../../components/BecomeCitizenModal";
import { CONTINENT_NFT } from "../../utils/const";

const Main = () => {
  const [ownerOf, setOwnerOf] = useState<number>(0);
  const [listOfCitizenShipContinents, setListOfCitizenShipContinents] =
    useState<number[]>([]);
  const [allContinents, setAllContinents] = useState<any>([
    {
      tokenId: "",
      name: "",
      description: "",
      image: "",
      area_in_km_sq: "",
      number_of_countries: "",
    },
  ]);
  const [showCitizenshipModal, setShowCitizenshipModal] =
    useState<boolean>(false);

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [currentNftId, setCurrentNftId] = useState<number>(0);

  const { isConnected, address } = useAccount();
  const navigate = useNavigate();

  const resetState = () => {
    setOwnerOf(0);
    setListOfCitizenShipContinents([]);
    setCurrentNftId(0);
    setAllContinents([
      {
        tokenId: "",
        name: "",
        description: "",
        image: "",
        area_in_km_sq: "",
        number_of_countries: "",
      },
    ]);
  };

  const getAllContinents = async () => {
    setIsLoading(true);

    const contracts = [];
    for (let i = 1; i <= 7; i++) {
      contracts.push({
        ...CONTINENT_NFT,
        functionName: "tokenURI",
        args: [i],
      });
    }
    const readNftData = await readContracts({
      contracts,
    });

    console.log({ readNftData });

    const allTokenData = [];

    for (let i = 0; i < readNftData.length; i++) {
      if (readNftData[i].status === "success") {
        const tokenDetails = await fetch(`${readNftData[i]?.result}`);
        const tokenData: any = await tokenDetails.json();

        allTokenData.push({ ...tokenData, tokenId: i + 1 });
      }
    }

    setAllContinents(allTokenData);

    setIsLoading(false);
  };

  const checkUserStatus = async () => {
    const continentId = await readContract({
      ...CONTINENT_NFT,
      functionName: "ownerContinentTokenId",
      args: [address],
    });

    if (continentId) setOwnerOf(Number(continentId));

    const listOfContinents: any = await readContract({
      ...CONTINENT_NFT,
      functionName: "getContinentOfCitizenship",
      args: [address],
    });

    console.log({ listOfContinents });

    setListOfCitizenShipContinents(listOfContinents.map((r: any) => Number(r)));
  };

  useEffect(() => {
    if (isConnected) {
      handleOnCitizenshipSuccess();
    } else {
      navigate("/");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, address]);

  const handleOnCitizenshipSuccess = () => {
    resetState();
    getAllContinents();
    checkUserStatus();
  };

  return (
    <div className="flex flex-col gap-5 justify-center items-center">
      {isLoading ? (
        <div role="status">
          <svg
            aria-hidden="true"
            className="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
            viewBox="0 0 100 101"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
              fill="currentColor"
            />
            <path
              d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
              fill="currentFill"
            />
          </svg>
          <span className="sr-only">Loading...</span>
        </div>
      ) : allContinents && allContinents.length ? (
        allContinents.map((tokenData: any) => {
          if (
            tokenData &&
            Object.keys(tokenData).length &&
            tokenData.name !== ""
          ) {
            return (
              <div
                className="flex gap-4"
                onClick={() => {
                  if (tokenData.tokenId == ownerOf) {
                    navigate("/");
                  }
                }}
              >
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

                {ownerOf === 0 ? (
                  <div className="flex gap-5 justify-center items-center">
                    {listOfCitizenShipContinents.indexOf(tokenData.tokenId) >=
                    0 ? (
                      <div>You are already a citizen</div>
                    ) : (
                      <button
                        type="button"
                        className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
                        onClick={() => {
                          setCurrentNftId(tokenData.tokenId);
                          setShowCitizenshipModal(true);
                        }}
                      >
                        Become Citizen
                      </button>
                    )}
                  </div>
                ) : tokenData.tokenId == ownerOf ? (
                  <div className="flex gap-5 justify-center items-center">
                    You are owner
                  </div>
                ) : (
                  <div className="flex gap-5 justify-center items-center">
                    You are not the owner
                  </div>
                )}
              </div>
            );
          } else {
            return <></>;
          }
        })
      ) : (
        <div>No Continents minted</div>
      )}

      {/* <!-- Main modal --> */}
      {showCitizenshipModal ? (
        <CitizenshipModal
          setShowCitizenshipModal={setShowCitizenshipModal}
          nftId={currentNftId}
          handleOnCitizenshipSuccess={handleOnCitizenshipSuccess}
        />
      ) : null}
    </div>
  );
};

export default Main;

// {"name":"Asia","description":"Asia","image":"https://azure-slim-guineafowl-524.mypinata.cloud/ipfs/QmVvxwwk49RUDHisVAuh5uJ6ZSKkxN4NtVsyWCDWa9QY9z/asia.webp","area_in_km_sq":44580000,"number_of_countries":48}
