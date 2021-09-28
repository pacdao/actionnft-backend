# PAC DAO Action NFT 1

![Action NFT 1](https://pbs.twimg.com/media/E_f3Cr0XsAgtOkR?format=jpg&name=small)

The frontend for Pac DAO NFT 1

* [🌐  Web](https://pac.xyz/)
* [🎮  Discord ](https://discord.gg/tbBKXQqm)
* [🛫  Telegram ](https://t.me/joinchat/VYYqN19O3Wc4OTZh)
* [🦅  Twitter](https://twitter.com/pacdao)

This frontend was deployed permanently to IPFS via Fleek for the first Action NFT sale: [https://orange-lake-2728.on.fleek.co/](https://orange-lake-2728.on.fleek.co/)

The associated frontend was checked in to [https://github.com/pacdao/actionnft-frontend](https://github.com/pacdao/actionnft-frontend).  

![Common NFT](https://lh3.googleusercontent.com/EaMqiaLdKLOYI96NzfRcDHTh_bzdp4EvW98kZRoo5k6WFV3ywh-bqjS81_cSL1Y3jdbHHN2DuxRRWD7u3jnN0liO2iTQ8hZfUpI_7g=w332)

The rare auction contract was deployed to [0xd56c12efd06252f1f0098a8fe517da286245c0a8](https://etherscan.io/address/0xd56c12efd06252f1f0098a8fe517da286245c0a8), allowing the top five bidders to receive the rare version of the NFT, with all else able to claim a refund after the resolution.

The common version was deployed to to [0xe60a7825a80509de847ffe30ce2936dfc770db6b](https://etherscan.io/address/0xe60a7825a80509de847ffe30ce2936dfc770db6b),
 issued with a cap of 3000 and a linear price ramp of .001 after each mint from a .005 floor price.
 
The Action is targeting the infrastructure bill, which contained irrelevant and damaging language about cryptocurrency.  The scored action is any politician who brings to floor vote an amendment to remove this language.  The conclusion is determined by the PAC DAO.
 

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
