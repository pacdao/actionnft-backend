import brownie
import pytest
from brownie import *

# Withdraw Procedures
# Admin has two functions:
# 1. Admin can withdraw
# 2. Admin can


def test_admin_withdrawal_on_victory(victory, alice):
    contract_balance = victory.balance()
    start_bal = alice.balance()
    victory.withdrawTreasury({"from": alice})
    assert alice.balance() == start_bal + contract_balance


def test_admin_cannot_immediately_withdraw_on_defeat(defeat, alice):
    contract_balance = defeat.balance()
    start_bal = alice.balance()
    with brownie.reverts():
        defeat.withdrawTreasury({"from": alice})


def test_admin_can_withdraw_after_withdraw_period(defeat, alice):
    contract_balance = defeat.balance()
    start_bal = alice.balance()
    chain.mine(timedelta=defeat.withdrawWindow())
    defeat.withdrawTreasury({"from": alice})

    assert alice.balance() == start_bal + contract_balance


def test_nft_disappears_on_withdraw(defeat, bob):
    nft = defeat
    assert nft.balanceOf(bob) == 1
    nft.refundAll({"from": bob})
    assert nft.balanceOf(bob) == 0


def test_bob_gets_refund(defeat, bob):
    nft = defeat
    init_bal = bob.balance()
    nft.refundAll({"from": bob})
    assert bob.balance() > init_bal


def test_many_nfts_disappear_on_withdraw(nft, alice, bob):
    payment_price = nft.getCostMany(10)[0]
    nft.mintMany(10, {"from": bob, "value": payment_price})
    assert nft.balanceOf(bob) == 10

    # Trigger withdraw period
    nft.signResolution(False, {"from": alice})

    nft.refundAll({"from": bob})
    assert nft.balanceOf(bob) == 0


def test_cannot_withdraw_after_transfer(defeat, bob):
    mint = defeat
    mint.transferFrom(bob, accounts[2], mint.tokenOfOwnerByIndex(bob, 0), {"from": bob})
    with brownie.reverts():
        mint.refundAll({"from": bob})


def test_recipient_cannot_withdraw(defeat, bob):
    mint = defeat
    mint.transferFrom(bob, accounts[2], mint.tokenOfOwnerByIndex(bob, 0), {"from": bob})
    with brownie.reverts():
        mint.refundAll({"from": accounts[2]})


def test_cannot_withdraw_after_multi_transfer(nft, alice, bob):
    payment_price = nft.getCostMany(10)[0]
    nft.mintMany(10, {"from": bob, "value": payment_price})
    assert nft.balanceOf(bob) == 10

    # Trigger withdraw period
    nft.signResolution(False, {"from": alice})

    nft.transferFrom(bob, accounts[2], nft.tokenOfOwnerByIndex(bob, 0), {"from": bob})
    with brownie.reverts():
        nft.refundAll({"from": bob})


# Auction Tests


def test_cannot_withdraw_while_auction_live(bids):
    for a in accounts:
        with brownie.reverts():
            bids.withdraw({"from": a})


def test_final_supply_at_cap(ended):
    assert ended.totalSupply() == 5


def test_cannot_withdraw_if_winner(ended):
    assert ended.isTopBidder(accounts[9]) == True
    with brownie.reverts():
        ended.withdraw({"from": accounts[9]})


def test_cannot_withdraw_after_1_month(ended):
    timedelta = ended.auctionEndTime() + (60 * 60 * 24 * 60) - chain.time()
    chain.mine(timedelta=timedelta)
    for a in accounts:
        with brownie.reverts():
            ended.withdraw({"from": a})


# def test_treasury_balance_increases_on_mint(nft, bob):
#    nft.mintCommon({'from': bob, 'value': nft.commonPrice()})

#    assert nft.treasuryBalance() > 0
