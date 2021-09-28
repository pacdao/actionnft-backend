import brownie
import pytest
from brownie import *

# Common Contract


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


def test_admin_cannot_withdraw_during_sale_period(mint, alice):
    init_balance = alice.balance()
    with brownie.reverts():
        mint.withdrawTreasury({"from": alice})
    assert alice.balance() == init_balance


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
    with brownie.reverts("Must have original"):
        mint.refundAll({"from": bob})


def test_recipient_cannot_withdraw(defeat, bob):
    mint = defeat
    mint.transferFrom(bob, accounts[2], mint.tokenOfOwnerByIndex(bob, 0), {"from": bob})
    with brownie.reverts("No balance to withdraw"):
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


def test_final_supply_at_cap(ended):
    assert ended.totalSupply() == 5


def test_cannot_withdraw_if_winner(ended):
    assert ended.isTopBidder(accounts[9]) == True
    with brownie.reverts():
        ended.withdraw({"from": accounts[9]})


def test_cannot_withdraw_after_expiry(ended):
    timedelta = ended.auctionEndTime() + (60 * 60 * 24 * 60) - chain.time()
    chain.mine(timedelta=timedelta)
    for a in accounts:
        with brownie.reverts():
            ended.withdraw({"from": a})


# Bonus withdraws from Transfer


@pytest.mark.skip_coverage
def test_can_transfer_at_limit(at_limit, alice, bob):
    at_limit.signResolution(False, {"from": alice})
    alice_init = at_limit.balanceOf(alice)
    bob_init = at_limit.balanceOf(bob)
    alice_token = at_limit.tokenOfOwnerByIndex(alice, 0)
    at_limit.transferFrom(alice, bob, alice_token, {"from": alice})
    assert at_limit.balanceOf(alice) == alice_init - 1
    assert at_limit.balanceOf(bob) == bob_init + 1
    assert at_limit.ownerOf(alice_token) == bob


def test_withdraw_after_transfer_receiver(mint, alice, bob):
    at_limit = mint
    init_bal = at_limit.balanceOf(bob)
    at_limit.mintMany(5, {"from": alice, "value": at_limit.getCostMany(5)[0]})
    at_limit.signResolution(False, {"from": alice})
    alice_init = at_limit.balanceOf(alice)
    bob_init = at_limit.balanceOf(bob)
    bob_balance = bob.balance()

    alice_token = at_limit.tokenOfOwnerByIndex(alice, 0)
    at_limit.transferFrom(alice, bob, alice_token, {"from": alice})

    at_limit.refundAll({"from": bob})

    assert init_bal == at_limit.balanceOf(bob)
    assert bob_balance < bob.balance()


@pytest.mark.skip_coverage
def test_withdraw_after_transfer_sender_fails(at_limit, alice, bob):
    at_limit.signResolution(False, {"from": alice})
    alice_init = at_limit.balanceOf(alice)
    bob_init = at_limit.balanceOf(bob)
    alice_token = at_limit.tokenOfOwnerByIndex(alice, 0)
    at_limit.transferFrom(alice, bob, alice_token, {"from": alice})

    with brownie.reverts("Must have original"):
        at_limit.refundAll({"from": alice})


def test_cannot_withdraw_after_admin_window(mint, alice):
    mint.signResolution(False, {"from": alice})
    chain.mine(timedelta=mint.withdrawWindow())
    with brownie.reverts("Withdraw Period Ended"):
        mint.refundAll({"from": alice})


def test_user_cannot_withdraw_early(bids, alice):
    init_bal = alice.balance()
    with brownie.reverts("Auction not ended"):
        bids.withdraw({"from": alice})
    assert init_bal == alice.balance()


def test_user_can_withdraw_after_auction(ended, alice):

    init_bal = alice.balance()
    stored_val = ended.withdrawableBalance(alice)
    ended.withdraw({"from": alice})
    assert init_bal < alice.balance()
    assert init_bal + stored_val == alice.balance()


def test_withdraw_updates_balance(ended, alice):
    init_bal = alice.balance()
    ended.withdraw({"from": alice})
    assert ended.withdrawableBalance(alice) == 0


def test_winner_cannot_withdraw_after_auction(ended, accounts):
    account = accounts[9]
    assert ended.isTopBidder(account) == True
    init = account.balance()
    with brownie.reverts("Winners cannot withdraw"):
        ended.withdraw({"from": account})
    assert init == account.balance()


def test_user_cannot_withdraw_late(ended, alice):
    init = alice.balance()
    chain.mine(timedelta=ended.withdrawWindow() + 1)
    with brownie.reverts("Withdraw window ended"):
        ended.withdraw({"from": alice})
    assert init == alice.balance()


def test_admin_cannot_withdraw_early(bids, alice):
    init = alice.balance()
    with brownie.reverts("Auction ongoing"):
        bids.withdrawTreasury({"from": alice})
    assert init == alice.balance()


def test_admin_cannot_withdraw_after_auction(ended, alice):
    init = alice.balance()
    with brownie.reverts("Withdraw window"):
        ended.withdrawTreasury({"from": alice})
    assert init == alice.balance()


def test_admin_can_withdraw_late(ended, alice):
    init = alice.balance()
    chain.mine(timedelta=ended.withdrawWindow() + 1)
    ended.withdrawTreasury({"from": alice})
    assert init < alice.balance()


def test_withdraw_drains_contract(ended, alice):
    init = alice.balance()
    chain.mine(timedelta=ended.withdrawWindow() + 1)
    ended.withdrawTreasury({"from": alice})
    assert ended.balance() == 0


# liWthdraw Window

# liWthdraw Window

# Fun

# def test_treasury_balance_increases_on_mint(nft, bob):
#    nft.mintCommon({'from': bob, 'value': nft.commonPrice()})

#    assert nft.treasuryBalance() > 0
