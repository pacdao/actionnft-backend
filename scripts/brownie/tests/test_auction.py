import brownie
import pytest
from brownie import *


def test_initial_bid_updates(nft_rare, bob):
    nft_rare.bidRare({"from": bob, "value": nft_rare.bidPrice()})
    assert nft_rare.topBidders(0)[1] == bob


def test_initially_top_5_empty(nft_rare):
    for i in range(5):
        assert nft_rare.topBidders(i)[1] == ZERO_ADDRESS


def test_limit_5_in_leaderboard(bids):
    with brownie.reverts():
        bids.topBidders(5)


def test_top_5_as_expected(bids):
    for i in range(5):
        assert bids.topBidders(i)[1] == accounts[(9 - i)]


def test_silver_to_gold(bids):
    silver = bids.topBidders(1)[1]
    gold_val_diff = bids.topBidders(0)[0] - bids.topBidders(1)[0]
    bids.bidRare({"from": silver, "value": gold_val_diff + 1})
    assert bids.topBidders(0)[1] == silver


def test_cannot_bid_after_auction_ends(bids, alice):
    bids.setAuctionEnded({"from": alice})
    with brownie.reverts():
        bids.bidRare({"from": alice, "value": bids.topBidders(0)[0]})


def test_is_winner_accurate(bids):

    for i in range(10):
        status = bids.isTopBidder(accounts[i])
        if i < 5:
            assert status == False
        else:
            assert status == True


def test_is_winners_cap_accurate(bids):
    winners = 0
    for a in accounts:
        if bids.isTopBidder(a) == True:
            winners = winners + 1
    assert winners == 5


def test_bid_auction_ends(bids, alice):
    bids.setAuctionEnded({"from": alice})
    assert bids.auctionEnded() == True


def test_rando_cannot_end_auction(bids, bob):
    with brownie.reverts():
        bids.setAuctionEnded({"from": bob})


def test_winners_get_mints(ended):
    for i in range(5):
        assert ended.balanceOf(accounts[i + 5]) == 1


def test_losers_get_no_mints(ended):
    for i in range(5):
        assert ended.balanceOf(accounts[i]) == 0
