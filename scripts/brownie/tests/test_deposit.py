import brownie
import pytest


def test_can_buy_common(nft, bob):
    nft.mintCommon({"from": bob, "value": nft.commonPrice()})
    assert nft.ownerOf(1) == bob


def test_can_buy_common_overpriced(nft, bob):
    nft.mintCommon({"from": bob, "value": nft.commonPrice() * 2})
    assert nft.ownerOf(1) == bob


def test_cannot_buy_common_underpriced(nft, bob):
    with brownie.reverts("Underpriced"):
        nft.mintCommon({"from": bob, "value": nft.commonPrice() - 1})


def test_price_increases_on_buy(nft, bob):
    init_price = nft.commonPrice()
    nft.mintCommon({"from": bob, "value": nft.commonPrice()})
    assert nft.commonPrice() > init_price


def test_price_increases_by_ramp_rate(nft, bob):
    init_price = nft.commonPrice()
    nft.mintCommon({"from": bob, "value": nft.commonPrice()})
    assert nft.commonPrice() == init_price + nft.rampRate()
    # assert nft.commonPrice() == init_price * (nft.rampRate() / 10 ** 18)


def test_price_multibid_increases_by_ramp_rate(nft, bob):
    last_price = nft.commonPrice()
    for i in range(10):
        nft.mintCommon({"from": bob, "value": nft.commonPrice()})
        assert nft.commonPrice() == (last_price + nft.rampRate())
        last_price = nft.commonPrice()


def test_mint_counter_increases_on_mint(nft, bob):
    nft.mintCommon({"from": bob, "value": nft.commonPrice()})
    assert nft.originalMintCount(bob) == 1


def test_withdraw_balance_increases_on_mint(nft, bob):
    nft.mintCommon({"from": bob, "value": nft.commonPrice()})
    assert nft.withdrawableBalance(bob) > 0


def test_can_mint_many(nft, bob):
    payment_price = nft.getCostMany(10)[0]
    nft.mintMany(10, {"from": bob, "value": payment_price})
    assert nft.balanceOf(bob) == 10


def test_mint_counter_correct_multimint(nft, bob):
    payment_price = nft.getCostMany(10)[0]
    nft.mintMany(10, {"from": bob, "value": payment_price})
    assert nft.originalMintCount(bob) == 10


def test_mint_many_cannot_underpay(nft, bob):
    quantity = 5
    many_price = nft.getCostMany(quantity)[0]
    with brownie.reverts("Underpriced"):
        nft.mintMany(quantity, {"from": bob, "value": many_price - 1})


def test_mint_many_price_advances_as_reported(nft, bob):
    quantity = 5
    many_price, next_price = nft.getCostMany(quantity)
    nft.mintMany(quantity, {"from": bob, "value": many_price})
    assert nft.commonPrice() == next_price


def test_mint_many_equivalent_to_several_single(nft, bob, chain):
    quantity = 5
    chain.snapshot()
    many_price = nft.getCostMany(quantity)[0]
    nft.mintMany(quantity, {"from": bob, "value": many_price})

    assert nft.balanceOf(bob) == quantity

    chain.revert()
    paid = 0
    for i in range(5):
        price = nft.commonPrice()
        paid += price
        nft.mintCommon({"from": bob, "value": price})

    assert nft.balanceOf(bob) == quantity
    assert paid == many_price


def test_cannot_mint_after_victory(victory, bob):
    with brownie.reverts("Minting period over"):
        victory.mintCommon({"from": bob, "value": victory.commonPrice()})


def test_cannot_mint_many_after_victory(victory, bob):
    with brownie.reverts("Minting period over"):
        victory.mintMany(5, {"from": bob, "value": victory.getCostMany(5)[0]})


def test_cannot_mint_after_defeat(defeat, bob):
    with brownie.reverts("Minting period over"):
        defeat.mintCommon({"from": bob, "value": defeat.commonPrice()})


def test_cannot_mint_many_after_defeat(defeat, bob):
    with brownie.reverts("Minting period over"):
        defeat.mintMany(5, {"from": bob, "value": defeat.getCostMany(5)[0]})


def test_only_admin_can_sign(mint, bob):
    with brownie.reverts("Only Admin"):
        mint.signResolution(True, {"from": bob})


# At Limit


@pytest.mark.skip_coverage
def test_at_limit(at_limit, alice):
    assert at_limit.totalSupply() == at_limit.mintCap()


@pytest.mark.skip_coverage
def test_cannot_pass_limit(at_limit, alice):
    with brownie.reverts("Insufficient Quantity"):
        at_limit.mintCommon({"from": alice, "value": at_limit.commonPrice()})


@pytest.mark.skip_coverage
def test_cannot_pass_limit_using_multi(at_limit, alice):
    with brownie.reverts("Insufficient Quantity"):
        at_limit.mintMany(1, {"from": alice, "value": at_limit.getCostMany(1)[0]})


def test_token_uri_correct(victory, bob):
    assert victory.tokenURI(1) == "QmTFMJ17s35Y2fHSomdTh29m8CdBPK8Cv8trXnAWTVJ1hc"
