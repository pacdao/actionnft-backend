// SPDX-License-Identifier: MIT
pragma solidity 0.8.7;

import '@openzeppelin/contracts/token/ERC721/ERC721.sol';
import '@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol';

contract ActionNFT is ERC721Enumerable {
  /* Variables */
  address payable private beneficiary;

  /* Common NFT */
  uint256 public currentId;
  uint256 public rampRate = 10**14;
  uint256 public commonPrice;
  mapping(address => uint256) public originalMintCount;

  /* Accounting Data */
  //uint256 public treasuryBalance;
  mapping(address => uint256) public withdrawableBalance;

  /* Mint Data */
  bool public canMint = true;
  uint256 public mintCap = 3000;

  /* Withdraw Data */
  bool public isWithdrawPeriod = false;
  uint256 public adminClaimTime;
  uint256 public withdrawWindow = 24 * 60 * 60 * 30;

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
    //treasuryBalance = (msg.value - _withdraw);
  }

  /* Payable Functions */
  function mintCommon() public payable canMintQuantity(1) {
    require(msg.value >= commonPrice);
    _processMint();
    commonPrice = nextPrice(commonPrice);
    store_withdrawable(msg.sender, msg.value);
    originalMintCount[msg.sender]++;
  }

  function mintMany(uint256 _mint_count)
    public
    payable
    canMintQuantity(_mint_count)
  {
    (uint256 _expectedTotal, uint256 _expectedFinal) = getCostMany(_mint_count);
    require(msg.value >= _expectedTotal);
    for (uint256 _i = 0; _i < _mint_count; _i++) {
      _processMint();
    }
    originalMintCount[msg.sender] += _mint_count;
    commonPrice = _expectedFinal;
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
    uint256 _run_tot = 0;
    uint256 _cur_val = commonPrice;
    for (uint256 _i = 0; _i < mint_count; _i++) {
      _run_tot = _run_tot + _cur_val;
      _cur_val = nextPrice(_cur_val);
    }
    return (_run_tot, _cur_val);
  }

  function nextPrice(uint256 start_price) public view returns (uint256) {
    return start_price + rampRate;
  }

  /* Withdraw Functions */

  function withdrawTreasury() public saleEnded {
    require(block.timestamp >= adminClaimTime);

    beneficiary.transfer(address(this).balance);
  }

  function refundAll() public saleEnded {
    require(originalMintCount[msg.sender] >= balanceOf(msg.sender));

    uint256 _burnCount = originalMintCount[msg.sender];
    uint256[] memory _ownedTokens = new uint256[](_burnCount);

    for (uint256 _i = 0; _i < _burnCount; _i++) {
      _ownedTokens[_i] = tokenOfOwnerByIndex(msg.sender, _i);
    }
    for (uint256 _i = 0; _i < _burnCount; _i++) {
      _burn(_ownedTokens[_i]);
    }

    uint256 _val = withdrawableBalance[msg.sender];

    withdrawableBalance[msg.sender] = 0;
    payable(msg.sender).transfer(_val);
  }

  /* Admin Functions */
  function signResolution(bool _resolution) public {
    canMint = false;

    // Floor Vote Successful
    if (_resolution == true) {
      // Admin can claim immediately
      adminClaimTime = block.timestamp;

      // Floor Vote Unsuccessful
    } else {
      // Withdraw period is active
      isWithdrawPeriod = true;
      adminClaimTime = block.timestamp + withdrawWindow;
    }
  }

  function updateBeneficiary(address payable _newBeneficiary) public onlyAdmin {
    beneficiary = _newBeneficiary;
  }

  function setTokenUri(uint256 _tokenId, string memory _newUri)
    public
    onlyAdmin
  {
    // _setTokenURI(_tokenId, _newUri);
  }

  function setDefaultMetadata(string memory _newUri) public onlyAdmin {
    //defaultMetadata = _newUri;
    // _setBaseURI(_newUri);
  }

  /* Fallback Functions */
  receive() external payable {}

  fallback() external payable {}

  /* Modifiers */
  modifier onlyAdmin() {
    require(msg.sender == beneficiary);
    _;
  }
  modifier saleEnded() {
    require(canMint == false);
    _;
  }
  modifier canMintQuantity(uint256 _quantity) {
    require(canMint == true, 'Minting period over');
    require(totalSupply() + _quantity <= mintCap, 'Insufficient Quantity');
    _;
  }
}
