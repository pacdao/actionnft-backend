from brownie import *
from brownie.network import priority_fee, max_fee


def main():
    action_value = .05 * 10 ** 18

    # requires brownie account to have been created
    if network.show_active() == "development":
        # add these accounts to metamask by importing private key
        owner = accounts[0]
        deployed = ActionNFT.deploy(owner, action_value, {"from": accounts[0]})
        deployed = ActionNFTRare.deploy(owner, 2 * 10 ** 16, {"from": accounts[0]})

    elif network.show_active() in ['mainnet', 'mainnet-fork']:
        deployer = accounts.load('minnow')

        if network.show_active() == 'mainnet-fork':
            publish_source=False
        else:
            priority_fee('2 gwei')
            publish_source=True

        beneficiary_address = '0xf27AC88ac7e80487f21e5c2C847290b2AE5d7B8e'
        deploy1 = ActionNFT.deploy(
            beneficiary_address, action_value, {'from': deployer}, publish_source=publish_source
         )
        deployed = ActionNFTRare.deploy(
            beneficiary_address, 1 * 10 ** 16, {"from": deployer}, publish_source=publish_source
        )


    else:
        # add these accounts to metamask by importing private key
        owner = accounts.load("husky")
        deployed = ActionNFT.deploy(
            owner, action_value, {"from": owner}, publish_source=True
        )
        deployed = ActionNFTRare.deploy(
            owner, 1 * 10 ** 16, {"from": owner}, publish_source=True
        )

    return deployed
