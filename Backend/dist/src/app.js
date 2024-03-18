"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const web3_1 = __importStar(require("web3"));
const cors_1 = __importDefault(require("cors"));
const Continent_1 = require("../ABI/Continent");
require("dotenv/config");
const app = (0, express_1.default)();
const port = 3000;
const accountSecretKey = process.env.ACCOUNT_PRIVATE_KEY;
app.use(express_1.default.json());
app.use((0, cors_1.default)());
app.post("/become-citizen", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { continentId, value, networkId } = req.body;
        let web3 = new web3_1.default(new web3_1.default.providers.HttpProvider(process.env.NODE_RPC));
        if (networkId == 80001) {
            web3 = new web3_1.default(new web3_1.default.providers.HttpProvider(process.env.NODE_RPC_MATIC_MUMBAI));
        }
        const nftContract = new web3.eth.Contract(Continent_1.ContinentNft, Continent_1.ContinentNftAddress);
        const account = yield web3.eth.accounts.privateKeyToAccount(accountSecretKey);
        web3.eth.defaultAccount = account.address;
        const result = yield nftContract.methods
            .becomeCitizen(continentId)
            .send({ from: account.address, value: web3.utils.toWei(value, "ether") });
        res.json({
            message: "Transaction submitted successfully",
            data: result.transactionHash,
        });
    }
    catch (e) {
        if (e instanceof web3_1.ContractExecutionError) {
            if (e.innerError instanceof web3_1.Eip838ExecutionError) {
                res.status(400).send({ message: e.innerError.toJSON().message });
            }
        }
        else {
            res.status(400).send({ message: e.message });
        }
    }
}));
app.listen(port, () => {
    return console.log(`Express is listening at http://localhost:${port}`);
});
//# sourceMappingURL=app.js.map