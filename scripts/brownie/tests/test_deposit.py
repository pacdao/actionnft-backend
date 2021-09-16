import pytest, brownie

def test_can_buy_common(nft, bob):
    nft.mintCommon({'from': bob, 'value': nft.commonPrice()})
    assert nft.ownerOf(1) == bob

def test_can_buy_common_overpriced(nft, bob):
    nft.mintCommon({'from': bob, 'value': nft.commonPrice() * 2})
    assert nft.ownerOf(1) == bob

def test_cannot_buy_common_underpriced(nft, bob):
    with brownie.reverts():
        nft.mintCommon({'from': bob, 'value': nft.commonPrice() / 2})

def test_price_increases_on_buy(nft, bob):
    init_price = nft.commonPrice()
    nft.mintCommon({'from': bob, 'value': nft.commonPrice()})
    assert nft.commonPrice() > init_price


def test_price_increases_by_ramp_rate(nft, bob):
    init_price = nft.commonPrice()
    nft.mintCommon({'from': bob, 'value': nft.commonPrice()})
    assert nft.commonPrice() == init_price * (nft.rampRate() / 10 ** 18)

def test_price_multibid_increases_by_ramp_rate(nft, bob):
    last_price = nft.commonPrice()
    for i in range(10):
        nft.mintCommon({'from': bob, 'value': nft.commonPrice()})
        assert nft.commonPrice() // 10 ** 16 == last_price * (nft.rampRate() / 10 ** 18) // 10 ** 16
        last_price = nft.commonPrice()


def test_mint_counter_increases_on_mint(nft, bob):
    nft.mintCommon({'from': bob, 'value': nft.commonPrice()})
    assert nft.originalMintCount(bob) == 1

def test_treasury_balance_increases_on_mint(nft, bob):
    nft.mintCommon({'from': bob, 'value': nft.commonPrice()})
    assert nft.treasuryBalance() > 0

def test_withdraw_balance_increases_on_mint(nft, bob):
    nft.mintCommon({'from': bob, 'value': nft.commonPrice()})
    assert nft.withdrawableBalance(bob) > 0

def test_can_mint_many(nft, bob):
    payment_price = nft.getCostMany(10)[0]
    nft.mintMany(10, {'from': bob, 'value': payment_price})
    assert nft.balanceOf(bob) == 10

def test_mint_counter_correct_multimint(nft, bob):
    payment_price = nft.getCostMany(10)[0]
    nft.mintMany(10, {'from': bob, 'value': payment_price})
    assert nft.originalMintCount(bob) == 10


