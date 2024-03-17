/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { useNavigate } from "react-router-dom";
import { readContract, readContracts } from "@wagmi/core";

import CitizenshipModal from "../../components/BecomeCitizenModal";
import { CONTINENT_NFT } from "../../utils/const";
import { manageError } from "../../utils/helper";
import Loader from "../../components/Loader";

const Continent = () => {
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
    try {
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

      const listOfContinents: any = await readContract({
        ...CONTINENT_NFT,
        functionName: "getContinentOfCitizenship",
        args: [address],
      });

      console.log({ listOfContinents });

      setListOfCitizenShipContinents(
        listOfContinents.map((r: any) => Number(r))
      );
    } catch (e) {
      manageError(e);
    }
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
        <Loader />
      ) : allContinents && allContinents.length ? (
        allContinents.map((tokenData: any) => {
          if (
            tokenData &&
            Object.keys(tokenData).length &&
            tokenData.name !== ""
          ) {
            return (
              <div
                className={`flex gap-4 border-b border-2 m-4 p-8 rounded-lg ${
                  tokenData.tokenId == ownerOf && `cursor-pointer`
                }`}
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

export default Continent;
