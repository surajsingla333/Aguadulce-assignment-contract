import { useWeb3Modal } from "@web3modal/wagmi/react";

type connectWalletParam = {
  msg: string;
};

export default function ConnectWalletButtonWallet({ msg }: connectWalletParam) {
  const { open } = useWeb3Modal();

  //   useEffect(() => {
  //     console.log("THis is from the dashboard of Wallet");

  //     if (isConnected && isClicked) {
  //       navigate("/walletDashboard");
  //     } else {
  //       navigate("/");
  //       setIsClicked(false);
  //     }
  //   }, [isConnected]);

  return (
    <div>
      <button
        className=" border-2 border-gray-800 bg-gray-950  hover:border-gray-850 hover:bg-gray-800 text-white px-2 py-2 rounded-lg text-lg font-semibold tracking-wide "
        onClick={async () => {
          open();
        }}
      >
        {msg}
      </button>
    </div>
  );
}
