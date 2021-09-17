import pytest, brownie
from brownie import * 

def test_admin_withdrawal(mint, alice):
    start_bal = alice.balance()
    mint.withdrawTreasury({'from': accounts[0]})
    assert alice.balance() > start_bal

def test_nft_disappears_on_withdraw(mint, bob):
    nft = mint
    assert nft.balanceOf(bob) == 1
    nft.refundAll({'from': bob});
    assert nft.balanceOf(bob) == 0

def test_bob_gets_refund(mint, bob):
    nft = mint
    init_bal = bob.balance()
    nft.refundAll({'from': bob})
    assert bob.balance() > init_bal

def test_many_nfts_disappear_on_withdraw(nft, bob):
    payment_price = nft.getCostMany(10)[0]
    nft.mintMany(10, {'from': bob, 'value': payment_price})
    assert nft.balanceOf(bob) == 10
    nft.refundAll({'from': bob})
    assert nft.balanceOf(bob) == 0

def test_cannot_withdraw_after_transfer(mint, bob):
    mint.transferFrom(bob, accounts[2], mint.tokenOfOwnerByIndex(bob, 0), {'from': bob})
    with brownie.reverts():
        mint.refundAll({'from': bob})


def test_recipient_cannot_withdraw(mint, bob):
    mint.transferFrom(bob, accounts[2], mint.tokenOfOwnerByIndex(bob,0), {'from': bob})
    with brownie.reverts():
        mint.refundAll({'from': accounts[2]})

def test_cannot_withdraw_after_multi_transfer(nft, bob):
    payment_price = nft.getCostMany(10)[0]
    nft.mintMany(10, {'from': bob, 'value': payment_price})
    assert nft.balanceOf(bob) == 10

    nft.transferFrom(bob, accounts[2], nft.tokenOfOwnerByIndex(bob,0), {'from': bob})
    with brownie.reverts():
        nft.refundAll({'from': bob})



def test_cannot_withdraw_while_auction_live(bids):
    for a in accounts:
        with brownie.reverts():
            bids.withdraw({'from': a})

def test_final_supply_at_cap(ended):
    assert ended.totalSupply() == 5

def test_cannot_withdraw_if_winner(ended):
    assert ended.isTopBidder(accounts[9]) == True
    with brownie.reverts():
        ended.withdraw({'from': accounts[9]})

def test_cannot_withdraw_after_1_month(ended):
    timedelta = ended.auctionEndTime() + (60*60*24*60) - chain.time()
    chain.mine(timedelta=timedelta)
    for a in accounts:
        with brownie.reverts():
            ended.withdraw({'from': a})
