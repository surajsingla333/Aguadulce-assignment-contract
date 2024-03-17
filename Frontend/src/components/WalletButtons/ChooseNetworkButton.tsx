import { useWeb3Modal } from "@web3modal/wagmi/react";

export default function ChooseNetworkButton() {
  // 4. Use modal hook
  const { open } = useWeb3Modal();

  return (
    <>
      <button className=" border-2 px-3 py-2 rounded-lg border-gray-850" onClick={() => open({ view: "Networks" })}>Change Network</button>
    </>
  );
}
