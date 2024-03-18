import express from "express";
import Web3, { Eip838ExecutionError, ContractExecutionError } from "web3";
import cors from "cors";

import { ContinentNft, ContinentNftAddress } from "../ABI/Continent";
import "dotenv/config";

const app = express();
const port = 3000;

const accountSecretKey = process.env.ACCOUNT_PRIVATE_KEY;

app.use(express.json());
app.use(cors());

app.post("/become-citizen", async (req, res) => {
  try {
    const { continentId, value, networkId } = req.body;

    let web3 = new Web3(new Web3.providers.HttpProvider(process.env.NODE_RPC));
    if (networkId == 80001) {
      web3 = new Web3(
        new Web3.providers.HttpProvider(process.env.NODE_RPC_MATIC_MUMBAI)
      );
    }

    const nftContract = new web3.eth.Contract(
      ContinentNft,
      ContinentNftAddress[networkId]
        ? ContinentNftAddress[networkId]
        : ContinentNftAddress.default
    );

    const account = await web3.eth.accounts.privateKeyToAccount(
      accountSecretKey
    );

    web3.eth.defaultAccount = account.address;

    const result = await nftContract.methods
      .becomeCitizen(continentId)
      .send({ from: account.address, value: web3.utils.toWei(value, "ether") });

    res.json({
      message: "Transaction submitted successfully",
      data: result.transactionHash,
    });
  } catch (e) {
    if (e instanceof ContractExecutionError) {
      if (e.innerError instanceof Eip838ExecutionError) {
        res.status(400).send({ message: e.innerError.toJSON().message });
      }
    } else {
      res.status(400).send({ message: e.message });
    }
  }
});

app.listen(port, () => {
  return console.log(`Express is listening at http://localhost:${port}`);
});
