# Installation Notes

If you are having trouble running npm, try

`yarn` and remove the yarn lock


# Brownie Tests

Several brownie tests are included, run using:

```
brownie test
```

Run a local script for development using

```
brownie deploy -I
```

Deploy via

```
brownie deploy --network=mainnet -I
```


# Basic Sample Hardhat Project

This project demonstrates a basic Hardhat use case. It comes with a sample contract, a test for that contract, a sample script that deploys that contract, and an example of a task implementation, which simply lists the available accounts.

Try running some of the following tasks:

```shell
npx hardhat accounts
npx hardhat compile
npx hardhat clean
npx hardhat test
npx hardhat node
node scripts/sample-script.js
npx hardhat help
```

TODO:

setup webvitals
