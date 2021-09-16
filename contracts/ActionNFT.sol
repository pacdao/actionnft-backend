// SPDX-License-Identifier: MIT
pragma solidity 0.8.7;

import '@openzeppelin/contracts/token/ERC721/ERC721.sol';

contract ActionNFT is ERC721 {
  /* Variables */
  address payable private beneficiary;

  /* Common NFT */
  uint256 public currentId;
  uint256 public rampRate = 1200000000000000000;
  uint256 public commonPrice;
  mapping(address => uint256) public originalMintCount;

  /* Accounting Data */
  uint256 public treasuryBalance;
  mapping(address => uint256) public withdrawableBalance;

  constructor(address payable _beneficiary, uint256 _minPrice)
    public
    ERC721('PACDAO ACTION', 'PAC-A1')
  {
    beneficiary = _beneficiary;
    commonPrice = _minPrice;

    // _setBaseURI('ipfs://QmcnEZQiGVzPonWS2MENbdY8DkwhWcCW7YBQNk5yHYF112');
  }

  function store_withdrawable(address username, uint256 value) internal {
    uint256 _withdraw = (msg.value * 90) / 100;
    withdrawableBalance[msg.sender] += _withdraw;
    treasuryBalance = (msg.value - _withdraw);
  }

  /* Payable Functions */
  function mintCommon() public payable {
    require(msg.value >= commonPrice);
    _processMint();
    commonPrice = nextPrice(commonPrice);
    store_withdrawable(msg.sender, msg.value);
    originalMintCount[msg.sender]++;
  }

  function mintMany(uint256 _mint_count) public payable {
    (uint256 _expectedTotal, uint256 _expectedFinal) = getCostMany(_mint_count);
    require(msg.value >= _expectedTotal);
    for (uint256 _i = 0; _i < _mint_count; _i++) {
      _processMint();
    }
    originalMintCount[msg.sender] += _mint_count;
    commonPrice = nextPrice(_expectedFinal);
    store_withdrawable(msg.sender, msg.value);
  }

  /* Internal */
  function _processMint() internal {
    currentId += 1;
    _safeMint(msg.sender, currentId);
  }

  function getCostMany(uint256 mint_count)
    public
    view
    returns (uint256, uint256)
  {
    uint256 _run_tot = commonPrice;
    uint256 _cur_val = commonPrice;
    for (uint256 _i = 0; _i < mint_count; _i++) {
      _cur_val = nextPrice(_cur_val);
      _run_tot = _run_tot + _cur_val;
    }
    return (_run_tot, _cur_val);
  }

  function nextPrice(uint256 start_price) public view returns (uint256) {
    uint256 _target = (start_price * rampRate) / 1e18;
    if (_target - start_price < 1e14) {
      _target = start_price + 1e14;
    }
    _target = (_target / 1e14) * 1e14;
    return (_target);
  }

  /* Withdraw Functions */
  // function refundAll() public {
  //   require(originalMintCount[msg.sender] == balanceOf(msg.sender));
  //   uint256 _ownerCount = balanceOf(msg.sender);
  //   uint256[] memory _ownedTokens = new uint256[](_ownerCount);

  //   for (uint256 _i = 0; _i < _ownerCount; _i++) {
  //     _ownedTokens[_i] = tokenOfOwnerByIndex(msg.sender, _i);
  //   }
  //   for (uint256 _i = 0; _i < _ownerCount; _i++) {
  //     _burn(_ownedTokens[_i]);
  //   }

  //   uint256 _val = withdrawableBalance[msg.sender];

  //   withdrawableBalance[msg.sender] = 0;
  //   msg.sender.transfer(_val);
  // }

  function withdrawTreasury() public {
    beneficiary.transfer(treasuryBalance);
    treasuryBalance = 0;
  }

  /* Admin Functions */
  function updateBeneficiary(address payable _newBeneficiary) public {
    require(msg.sender == beneficiary);
    beneficiary = _newBeneficiary;
  }

  function setTokenUri(uint256 _tokenId, string memory _newUri) public {
    require(msg.sender == beneficiary);
    // _setTokenURI(_tokenId, _newUri);
  }

  function setDefaultMetadata(string memory _newUri) public {
    require(msg.sender == beneficiary);
    //defaultMetadata = _newUri;
    // _setBaseURI(_newUri);
  }

  /* Fallback Functions */
  receive() external payable {}

  fallback() external payable {}
}
