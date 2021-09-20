from brownie import *


def main():
    action_value = .05 * 10 ** 18

    # requires brownie account to have been created
    if network.show_active() == "development":
        # add these accounts to metamask by importing private key
        owner = accounts[0]
        deployed = ActionNFT.deploy(owner, action_value, {"from": accounts[0]})
        deployed = ActionNFTRare.deploy(owner, 2 * 10 ** 16, {"from": accounts[0]})

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
