import pytest, brownie
from brownie import * 

def test_equal_bid_doesnt_update(nft, bob):
    nft.bid_rare({'from': bob, 'value': nft.bidPrice() })
    assert nft.topBidder() == ZERO_ADDRESS;

def test_underbid_doesnt_update(nft, bob):
    nft.bid_rare({'from': bob, 'value': nft.bidPrice() / 2})
    assert nft.topBidder() == ZERO_ADDRESS;


def test_higher_bid_updates(nft, bob):
    nft.bid_rare({'from': bob, 'value': nft.bidPrice() +1})
    assert nft.topBidder() == bob




