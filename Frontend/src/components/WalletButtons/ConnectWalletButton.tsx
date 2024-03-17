import { useWeb3Modal } from "@web3modal/wagmi/react";
import { useState } from "react";

type connectWalletParam = {
  msg: string;
};

export default function ConnectWalletButton({ msg }: connectWalletParam) {
  const [isClicked, setIsClicked] = useState<boolean>(false);

  const { open } = useWeb3Modal();


  return (
    <div>
      <button
        className=" border-2 border-gray-800 bg-gray-950  hover:border-gray-850 hover:bg-gray-800 text-white px-2 py-2 rounded-lg text-lg font-semibold tracking-wide "
        onClick={async () => {
          setIsClicked(true);
          open();
          console.log(isClicked)
        }}
      >
        {msg}
      </button>
    </div>
  );
}
