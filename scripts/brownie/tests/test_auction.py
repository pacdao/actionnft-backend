import brownie
import pytest
from brownie import *


def test_initial_bid_updates(nft_rare, bob):
    nft_rare.bidRare({"from": bob, "value": nft_rare.bidUnits()})
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
    bids.bidRare({"from": silver, "value": gold_val_diff + bids.bidUnits()})
    assert bids.topBidders(0)[1] == silver

def test_no_dupes_in_top_5(bids):
    silver = bids.topBidders(1)[1]
    gold_val_diff = bids.topBidders(0)[0] - bids.topBidders(1)[0]
    bids.bidRare({"from": silver, "value": gold_val_diff + bids.bidUnits()})
    tallies = []
    for i in range(5):
        assert bids.topBidders(i)[1] not in tallies
        tallies.append(bids.topBidders(i)[1])


def test_top_5_keeps_5(bids):
    silver = bids.topBidders(1)[1]
    gold_val_diff = bids.topBidders(0)[0] - bids.topBidders(1)[0]
    bids.bidRare({"from": silver, "value": gold_val_diff + bids.bidUnits()})
    for i in range(5):
        assert bids.topBidders(1) != ZERO_ADDRESS


def test_top_5_values_preserve(bids):
    run_tot = 0
    for i in range(5):
        run_tot += bids.topBidders(i)[0]

    silver = bids.topBidders(1)[1]
    gold_val_diff = bids.topBidders(0)[0] - bids.topBidders(1)[0]
    bids.bidRare({"from": silver, "value": gold_val_diff + bids.bidUnits()})

    final_run_tot = 0
    for i in range(5):
        final_run_tot += bids.topBidders(i)[0]
    assert 0
    assert final_run_tot == run_tot + gold_val_diff + bids.bidUnits()




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

def test_can_increase_bid(bids):
    lowest = bids.topBidders(0)[0]
    account = accounts[3]
    my_bid = bids.bids(account)
    bids.bidRare({'from': account, 'value': (lowest - my_bid) + bids.bidUnits()}) 
    assert bids.topBidders(0)[1] == account 

def test_tie_does_not_supplant(bids):
    lowest = bids.topBidders(4)[0]
    account = accounts[3]
    my_bid = bids.bids(account)
    bids.bidRare({'from': account, 'value': (lowest - my_bid) }) 
    assert bids.topBidders(4)[1] != account

def test_tie_for_first_gets_silver(bids):
    account = accounts[3]

    my_bid = bids.bids(account)
    gold, medalist = bids.topBidders(0)
    bids.bidRare({'from': account, 'value': (gold - my_bid) })
    assert bids.topBidders(0)[1] == medalist
    assert bids.topBidders(1)[1] == account

def test_bid_value_updates(bids):
    account = accounts[2]
    my_bid = bids.bids(account)
    lowest = bids.topBidders(4)[0]
    bids.bidRare({'from': account, 'value': (lowest - my_bid) - bids.bidUnits()})

def test_bid_units(bids):
    account = accounts[3]
    with brownie.reverts("Bid units"):
        bids.bidRare({'from': account, 'value': 1})
