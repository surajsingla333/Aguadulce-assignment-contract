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
  }
};

export default config;
