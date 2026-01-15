import { defineConfig } from "hardhat/config";
import hardhatToolboxViemPlugin from "@nomicfoundation/hardhat-toolbox-viem";
import * as dotenv from "dotenv";

dotenv.config();

export default defineConfig({
  plugins: [hardhatToolboxViemPlugin],
  solidity: {
    version: "0.8.23",
  },
  networks: {
    mainnet: {
      url: process.env.MAINNET_URL || "",
      type: "http",
      accounts: process.env.MAINNET_ACCOUNTS ? JSON.parse(process.env.MAINNET_ACCOUNTS) : [],
    }, 
    testnet: {
      url: process.env.TESTNET_URL || "",
      type: "http",
      accounts: process.env.TESTNET_ACCOUNTS ? [process.env.TESTNET_ACCOUNTS] : [],
    }
  }
});
