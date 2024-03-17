import ConnectWalletButtonWallet from "../../components/WalletButtons/ConnectWalletButtonWallet";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { useNavigate } from "react-router-dom";
import { readContract, writeContract } from "@wagmi/core";

import AuctionModal from "../../components/AuctionModal";
import { ContinentNftAddress } from "../../lib/ABI/Continent";
import { ZERO_ADDRESS, AUCTION, CONTINENT_NFT } from "../../utils/const";

const Main = () => {
  const [showAuctionModal, setShowAuctionModal] = useState<boolean>(false);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showNft, setShowNft] = useState<boolean>(false);

  const [currentNftId, setCurrentNftId] = useState<number>(0);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [auctionData, setAuctionData] = useState<any>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [tokenData, setTokenData] = useState<any>({
    name: "",
    description: "",
    image: "",
    area_in_km_sq: "",
    number_of_countries: "",
  });
  const { isConnected, address } = useAccount();
  const navigate = useNavigate();

  const resetState = () => {
    setCurrentNftId(0);
    setAuctionData([]);
    setTokenData({
      name: "",
      description: "",
      image: "",
      area_in_km_sq: "",
      number_of_countries: "",
    });
  };
  const getData = async () => {
    setIsLoading(true);
    const data = await readContract({
      ...CONTINENT_NFT,
      functionName: "ownerContinentTokenId",
      args: [address],
    });
    console.log({ data });

    setCurrentNftId(Number(data));

    let tokenUri: unknown = "";
    if (data) {
      tokenUri = await readContract({
        ...CONTINENT_NFT,
        functionName: "tokenURI",
        args: [data],
      });
      console.log({ tokenUri });
    }
    if (tokenUri) {
      const tokenDetails = await fetch(tokenUri.toString());
      setTokenData(await tokenDetails.json());

      const AuctionDataTemp = await readContract({
        ...AUCTION,
        functionName: "nftContractAuctions",
        args: [ContinentNftAddress, data],
      });

      console.log("AuctionData ", AuctionDataTemp);
      setAuctionData(AuctionDataTemp);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (isConnected) {
      setShowNft(true);
      resetState();
      getData();
    } else {
      navigate("/");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, address]);

  const settleAuction = async () => {
    const AuctionDataTemp = await writeContract({
      ...AUCTION,
      functionName: "settleAuction",
      args: [ContinentNftAddress, currentNftId],
    });

    console.log("AuctionDataTemp", AuctionDataTemp);
  };

  const viewAuction = async () => {
    navigate("/auction");
  };

  const viewContinents = async () => {
    navigate("/continent");
  };

  const handleOnAuctionSuccess = () => {
    setShowNft(true);
    resetState();
    getData();
  };

  return (
    <div className="flex gap-5 h-screen justify-center items-center">
      {showNft ? (
        isLoading ? (
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
        ) : tokenData &&
          Object.keys(tokenData).length &&
          tokenData.name !== "" ? (
          <div className="flex gap-4">
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
              {auctionData && auctionData.length ? (
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                auctionData.filter((d: any) => d === ZERO_ADDRESS).length ===
                2 ? (
                  <div>
                    <div>No auction is active</div>
                    <button
                      type="button"
                      className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
                      onClick={() => setShowAuctionModal(true)}
                    >
                      Put in auction
                    </button>
                  </div>
                ) : (
                  <div>
                    <div>Auction is ongoing</div>
                    <h2 className="text-4xl font-extrabold dark:text-white">
                      Current highest bid details
                    </h2>
                    <div>Bidder: {auctionData[5]}</div>
                    <div>Bid amount: {auctionData[4]}</div>
                    <button
                      type="button"
                      className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
                      onClick={settleAuction}
                    >
                      Accept bid and end auction
                    </button>
                  </div>
                )
              ) : (
                <div>
                  <div>No auction is active</div>
                  <button
                    type="button"
                    className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
                    data-modal-target="static-modal"
                    data-modal-toggle="static-modal"
                    onClick={() => setShowAuctionModal(true)}
                  >
                    Put in auction
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div>
            <h2 className="text-4xl font-extrabold dark:text-white">
              You don't have any NFT
            </h2>
            <div className="flex gap-4 mt-6">
              <button
                type="button"
                className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
                onClick={viewAuction}
              >
                View all auction NFTs
              </button>

              <button
                type="button"
                className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
                onClick={viewContinents}
              >
                View all Continents for citizen ship
              </button>
            </div>
          </div>
        )
      ) : (
        <div className="mx-20 flex gap-5  justify-center items-center">
          <ConnectWalletButtonWallet msg="Connect your Wallet" />
        </div>
      )}

      {/* <!-- Main modal --> */}
      {showAuctionModal ? (
        <AuctionModal
          setShowAuctionModal={setShowAuctionModal}
          nftIdToPutInAuction={currentNftId}
          handleOnAuctionSuccess={handleOnAuctionSuccess}
        />
      ) : null}
    </div>
  );
};

export default Main;

// {"name":"Asia","description":"Asia","image":"https://azure-slim-guineafowl-524.mypinata.cloud/ipfs/QmVvxwwk49RUDHisVAuh5uJ6ZSKkxN4NtVsyWCDWa9QY9z/asia.webp","area_in_km_sq":44580000,"number_of_countries":48}
