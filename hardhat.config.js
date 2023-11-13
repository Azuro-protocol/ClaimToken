require("@nomiclabs/hardhat-ethers");
require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-chai-matchers");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */

const MUMBAI_PRIVATE_KEY = process.env.MUMBAI_PRIVATE_KEY || "";
const POLYGONSCAN_API_KEY = process.env.POLYGONSCAN_API_KEY || "";

const exportNetworks = {
  hardhat: {
    accounts: {
      accountsBalance: "1000000000000000000000000000000000",
    }
  },
};

if (MUMBAI_PRIVATE_KEY != "") {
  exportNetworks["mumbai"] = {
    url: "https://polygon-testnet-rpc.allthatnode.com:8545",
    accounts: [`${MUMBAI_PRIVATE_KEY}`],
  };
}

module.exports = {
  solidity: {
    compilers: [
      {
        version: "0.8.9",
        settings: {
          optimizer: {
            enabled: true,
            runs: 2,
          },
        },
      },
    ],
  },
  defaultNetwork: "hardhat",
  networks: exportNetworks,
  etherscan: {
    apiKey: {
      mumbai: POLYGONSCAN_API_KEY,
    },
    customChains: [
      {
        network: "mumbai",
        chainId: 80001,
        urls: {
          apiURL: "https://api-testnet.polygonscan.com/api",
          browserURL: "https://mumbai.polygonscan.com",
        },
      },
    ],
  },
};
