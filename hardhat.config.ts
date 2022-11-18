// eslint-disable-next-line @typescript-eslint/no-var-requires
require("custom-env").env(process.env.ENV);

import { task, HardhatUserConfig } from "hardhat/config";
import "@typechain/hardhat";
import "@nomiclabs/hardhat-etherscan";
import "solidity-coverage";
import "hardhat-deploy";
import "@nomiclabs/hardhat-ethers";
import "hardhat-gas-reporter";
import "@nomiclabs/hardhat-waffle";
import "hardhat-contract-sizer";

task("accounts", "Prints the list of accounts", async (args, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: "0.8.9",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    ],
  },
  namedAccounts: {
    deployer: {
      default: 0,
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
  },
  mocha: {
    timeout: 50000,
  },
  networks: {
    hardhat: {
      live: false,
      gas: "auto",
      gasPrice: "auto",
      gasMultiplier: 1,
      chainId: 1337,
      // mining: {
      //   auto: false,
      //   interval: 5000,
      // },
      accounts: {
        mnemonic: "test test test test test test test test test test test junk",
      },
      deploy: ["./deploy/scripts/localhost"],
    },
    localhost: {
      live: false,
      gas: "auto",
      gasPrice: "auto",
      gasMultiplier: 1,
      url: "http://127.0.0.1:8545",
      chainId: 1337,
      accounts: {
        mnemonic: "test test test test test test test test test test test junk",
      },
      deploy: ["./deploy/scripts"],
    },
    rinkeby: {
      live: true,
      gas: "auto",
      gasPrice: "auto",
      gasMultiplier: 1,
      chainId: 4,
      url: process.env.RINKEBY_URL,
      deploy: ["./deploy/scripts/rinkeby"],
      timeout: 300000,
    },
    polygon: {
      live: true,
      gas: "auto",
      gasPrice: "auto",
      gasMultiplier: 1,
      chainId: 137,
      url: process.env.POLYGON_URL,
      deploy: ["./deploy/scripts/polygon"],
      timeout: 300000,
    },
    testnet: {
      live: true,
      gas: "auto",
      gasPrice: "auto",
      gasMultiplier: 1,
      chainId: 137,
      url: process.env.POLYGON_URL,
      deploy: ["./deploy/scripts/testnet"],
      timeout: 300000,
    },
  },
  etherscan: {
    apiKey: {
      rinkeby: process.env.ETHERSCAN_API_KEY,
      polygon: process.env.POLYGONSCAN_API_KEY,
    },
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS === "true",
  },
};
export default config;
