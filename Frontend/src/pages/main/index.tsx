import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { useNavigate } from "react-router-dom";
import { readContract, writeContract, getNetwork } from "@wagmi/core";
import { formatEther } from "ethers";
import AuctionModal from "../../components/AuctionModal";
import { ZERO_ADDRESS } from "../../utils/const";
import {
  manageError,
  getDate,
  getContinentNftContract,
  getAuctionContract,
} from "../../utils/helper";
import Loader from "../../components/Loader";
import ConnectWalletButtonWallet from "../../components/WalletButtons/ConnectWalletButtonWallet";

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
    try {
      const network = getNetwork()?.chain?.id
        ? getNetwork()?.chain?.id
        : "default";

      const CONTINENT_NFT = getContinentNftContract(network);
      const AUCTION = getAuctionContract(network);

      const data = await readContract({
        ...CONTINENT_NFT,
        functionName: "ownerContinentTokenId",
        args: [address],
      });

      setCurrentNftId(Number(data));

      let tokenUri: unknown = "";
      if (data) {
        tokenUri = await readContract({
          ...CONTINENT_NFT,
          functionName: "tokenURI",
          args: [data],
        });
      }
      if (tokenUri) {
        const tokenDetails = await fetch(tokenUri.toString());
        setTokenData(await tokenDetails.json());

        const AuctionDataTemp = await readContract({
          ...AUCTION,
          functionName: "nftContractAuctions",
          args: [CONTINENT_NFT.address, data],
        });

        setAuctionData(AuctionDataTemp);
      }
    } catch (e) {
      manageError(e);
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
    try {
      const network = getNetwork()?.chain?.id
        ? getNetwork()?.chain?.id
        : "default";

      const CONTINENT_NFT = getContinentNftContract(network);
      const AUCTION = getAuctionContract(network);

      const AuctionDataTemp = await writeContract({
        ...AUCTION,
        functionName: "settleAuction",
        args: [CONTINENT_NFT.address, currentNftId],
      });

      if (AuctionDataTemp && AuctionDataTemp.hash) {
        handleOnAuctionSuccess();
      } else {
        throw "Something went wrong while creating auction.";
      }
    } catch (e) {
      manageError(e);
    }
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
          <Loader />
        ) : tokenData &&
          Object.keys(tokenData).length &&
          tokenData.name !== "" ? (
          <div className="flex gap-4 border-b border-2 m-4 p-8 rounded-lg">
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
                    <h2 className="text-xl font-bold dark:text-white">
                      Current highest bid details
                    </h2>
                    <div>Bidder: {auctionData[5]}</div>
                    <div>Bid amount: {formatEther(auctionData[4])}</div>

                    {Number(auctionData[2]) > 0 && (
                      <div>Auction ends at: {getDate(auctionData[2])} </div>
                    )}
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
            <h2 className="text-xl font-bold dark:text-white">
              You don't have any NFT
            </h2>
            <div className="flex gap-4 mt-6 border-b border-2 m-4 p-8 rounded-lg">
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
