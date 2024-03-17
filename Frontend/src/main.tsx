import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes";

import { createWeb3Modal, defaultWagmiConfig } from "@web3modal/wagmi/react";

import { WagmiConfig } from "wagmi";
import { polygonMumbai, localhost } from "viem/chains";
import AppLayout from "./components/AppLayout";

const projectId = "904623217cd89ca1a411940339ad0a1c";

const metadata = {
  name: "Web3Modal",
  description: "Web3Modal Example",
  url: "https://web3modal.com",
  icons: ["https://avatars.githubusercontent.com/u/37784886"],
};

const chains = [polygonMumbai, { ...localhost, id: 31_337 }];
// const chains = [polygonMumbai, { ...localhost, id: 31_337 }];
const wagmiConfig = defaultWagmiConfig({ chains, projectId, metadata });

createWeb3Modal({ wagmiConfig, projectId, chains });

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <WagmiConfig config={wagmiConfig}>
        <AppLayout>
          <AppRoutes />
        </AppLayout>
      </WagmiConfig>
    </BrowserRouter>
  </React.StrictMode>
);
