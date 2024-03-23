import { HardhatUserConfig } from "hardhat/config";
import "@openzeppelin/hardhat-upgrades";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: "0.8.0",
        settings: {},
      },
      {
        version: "0.8.20",
        settings: {},
      },
    ]
  },
  networks: {
    docker: {
      url: `http://hardhat-docker:8545`
    },
    mumbai: {
      url: "https://polygon-mumbai.infura.io/v3/${YOUR_INFURA_KEY}",
    },
  }
};

export default config;
