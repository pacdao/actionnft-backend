import { expect } from 'chai'
import { ethers } from 'hardhat'

let chainID,
  // admin,
  creator,
  ogBuyer,
  // buyer2,
  randomSigner1,
  // splitBeneficiary,
  royaltyFeeRecipient,
  royaltyFee,
  //  smartwallet,
  maxSupply
describe('ActionNFT', function () {
  before(async () => {
    let [] = ([
      // admin,
      creator,
      ogBuyer,
      // buyer2,
      randomSigner1,
      // splitBeneficiary,
    ] = await ethers.getSigners())
    let {} = ({ chainId: chainID } = await ethers.provider.getNetwork()) // destruring value from and setting to global value
  })

  it('Should deploy', async function () {
    const ActionNFT = await ethers.getContractFactory('ActionNFT')
    const actionnft = await ActionNFT.deploy(
      creator.address,
      (10 ** 16).toString(),
    )
    await actionnft.deployed()

    expect(await actionnft.name()).to.equal('PACDAO ACTION')

    // wait until the transaction is mined
    // await setGreetingTx.wait()
  })
})
describe('ActionNFTRare', function () {
  it('Should deploy', async function () {
    const ActionNFTRare = await ethers.getContractFactory('ActionNFTRare')
    const actionnftrare = await ActionNFTRare.deploy(
      creator.address,
      (2 * 10 ** 16).toString(),
    )
    await actionnftrare.deployed()
    expect(await actionnftrare.name()).to.equal('PACDAO ACTION NFT RARE')
  })
})
