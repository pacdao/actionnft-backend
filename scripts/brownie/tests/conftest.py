import pytest
from brownie import *


@pytest.fixture(scope="function", autouse=True)
def isolate(fn_isolation):
    # perform a chain rewind after completing each test, to ensure proper isolation
    # https://eth-brownie.readthedocs.io/en/v1.10.3/tests-pytest-intro.html#isolation-fixtures
    pass


@pytest.fixture(scope="function")
def alice(accounts):
    return accounts[0]


@pytest.fixture(scope="function")
def bob(accounts):
    return accounts[1]


@pytest.fixture(scope="function")
def nft(alice):
    return ActionNFT.deploy(alice, 10 ** 16, {"from": accounts[0]})


@pytest.fixture(scope="function")
def mint(nft, bob):
    nft.mintCommon({"from": bob, "value": nft.commonPrice()})
    return nft


@pytest.fixture(scope="function")
def victory(mint, alice):
    mint.signResolution(True, {"from": alice})
    return mint


@pytest.fixture(scope="function")
def defeat(mint, alice):
    mint.signResolution(False, {"from": alice})
    return mint


@pytest.fixture(scope="function")
def nft_rare(alice):
    return ActionNFTRare.deploy(alice, 2 * 10 ** 16, {"from": accounts[0]})


@pytest.fixture(scope="function")
def bids(nft_rare):
    for i in range(10):
        nft_rare.bidRare({"from": accounts[i], "value": nft_rare.bidPrice() * (i + 1)})
    return nft_rare


@pytest.fixture(scope="function")
def ended(bids, alice):
    bids.setAuctionEnded({"from": alice})
    return bids

@pytest.fixture(scope="function")
def at_limit(nft, accounts):
    accts = 10
    batches = 100
    for i in range(batches):
        user = i % accts
        cap = nft.mintCap()
        val = cap // batches
        remaining = nft.mintCap() - nft.totalSupply()
        if val >= remaining:
            val = remaining 
        nft.mintMany(val, {'from': accounts[user], 'value': nft.getCostMany(val)[0]})
    return nft
