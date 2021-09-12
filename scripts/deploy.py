from brownie import * 

def main():
    # requires brownie account to have been created
    if network.show_active()=='development':
        # add these accounts to metamask by importing private key
        owner = accounts[0]
        deployed = ActionNFT.deploy(owner, 10 ** 16, {'from':accounts[0]})

    else:
        # add these accounts to metamask by importing private key
        owner = accounts.load("husky")
        deployed = ActionNFT.deploy({'from':accounts[0]})

    return deployed

