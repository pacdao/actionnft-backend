import 'hardhat-gas-reporter'
import 'tsconfig-paths/register'
import 'solidity-coverage'
import '@nomiclabs/hardhat-ethers'
import '@nomiclabs/hardhat-etherscan'
import '@openzeppelin/hardhat-upgrades'
import { task } from 'hardhat/config'
import { config as dotenvConfig } from 'dotenv'
import { resolve } from 'path'

dotenvConfig({ path: resolve(__dirname, "./.env.local") });

// Ensure that we have all the environment variables we need.
const mnemonic: string | undefined = process.env.MNEMONIC;
if (!mnemonic) {
  throw new Error("MNEMONIC env var needs to be set.");
}

const infuraApiKey: string | undefined = process.env.INFURA_API_KEY;
if (!infuraApiKey) {
  throw new Error("INFURA_API_KEY needs to be set.");
}

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task('accounts', 'Prints the list of accounts', async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners()

  for (const account of accounts) {
    console.log(account.address)
  }
})


// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: '0.8.7',
  networks: {
    mainnet: {
      url: "https://mainnet.infura.io/v3/" + infuraApiKey,
      accounts: {
        mnemonic,
      },
    },
    kovan: {
      url: "https://kovan.infura.io/v3/" + infuraApiKey,
      accounts: {
        mnemonic,
      },
    },
    rinkeby: {
      url: "https://rinkeby.infura.io/v3/" + infuraApiKey,
      accounts: {
        mnemonic,
      },
    },
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
}
