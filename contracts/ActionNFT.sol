// SPDX-License-Identifier: MIT
pragma solidity 0.6.6;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract ActionNFT is ERC721 {

/* Variables */
    address payable private beneficiary;

/* Common NFT */
    uint256 public currentId;
    uint256 public rampRate = 1200000000000000000;
    uint256 public commonPrice;
    mapping (address => uint256) public originalMintCount;

/* Rare NFT */
    uint256 public bidPrice;
    address public topBidder;
    uint256 public lastBidTime;

    mapping (address => uint256) public bids;

    bool public auctionEnded = false;
    uint256 public auctionEndTime;
   
/* Accounting Data */ 
    uint256 public treasuryBalance;
    mapping (address => uint256) public withdrawableBalance;

    constructor (
	    address payable _beneficiary, 
	    uint256 _minPrice,
	    uint256 _bidPrice

    ) public ERC721 ("PACDAO ACTION", "PAC-A1"){
	 
	beneficiary = _beneficiary;
	bidPrice = _bidPrice;
	commonPrice = _minPrice;

	_setBaseURI("ipfs://QmcnEZQiGVzPonWS2MENbdY8DkwhWcCW7YBQNk5yHYF112");
    }

    function store_withdrawable(address username, uint256 value) internal {
	uint256 _withdraw = msg.value * 90 / 100;
	withdrawableBalance[msg.sender] += _withdraw;
	treasuryBalance = (msg.value - _withdraw);
    }

/* Payable Functions */
    function mint_common() public payable
    {
	require(msg.value >= commonPrice);
	_process_mint();
	commonPrice = next_price(commonPrice);
	store_withdrawable(msg.sender, msg.value);
	originalMintCount[msg.sender]++;
    }
    function mintMany(uint _mint_count) public payable {
	    (uint _expectedTotal, uint _expectedFinal ) = getCostMany(_mint_count);
	    require(msg.value >= _expectedTotal);
	for(uint _i = 0; _i < _mint_count; _i++) {
		_process_mint();	
	}
	originalMintCount[msg.sender] += _mint_count;
	commonPrice = next_price(_expectedFinal);
	store_withdrawable(msg.sender, msg.value);

    }
    function _process_mint() internal {
	currentId += 1;
	_safeMint(msg.sender, currentId);

    }
    function getCostMany(uint mint_count) public view returns (uint, uint) {
	uint _run_tot = commonPrice;
	uint _cur_val = commonPrice;
	for(uint _i = 0; _i < mint_count; _i++) {
		_cur_val = next_price(_cur_val);
		_run_tot = _run_tot + _cur_val;
	}
	return (_run_tot, _cur_val);
    }
    function next_price(uint start_price) public view returns (uint) {
	uint _target = start_price * rampRate / 1e18;
	if(_target - start_price < 1e14) {
		_target = start_price + 1e14;
	}
	_target = _target / 1e14 * 1e14;
	return(_target);

    }
    
    function bid_rare() public payable
    {
	  require(auctionEnded == false);
	  bids[msg.sender] += msg.value;
	  if(bids[msg.sender] > bidPrice) {
		topBidder = msg.sender; 
		bidPrice = bids[msg.sender];
	  }
	  lastBidTime = now;
	  store_withdrawable(msg.sender, msg.value);
    }

    function get_next_token_by_owner(address owner_id) public returns (uint256) {
	for(uint i = 0; i < totalSupply(); i++) {
		if(ownerOf(i) == owner_id) {
			return i;
		}	
	}
	return 0;
    }
    
/* Withdraw Functions */
	function withdraw() public {

		uint256 _val = withdrawableBalance[msg.sender];	
		msg.sender.transfer(_val);
		withdrawableBalance[msg.sender] = 0;
	}
	function withdraw_dao() public 
	{
		beneficiary.transfer(treasuryBalance);
		treasuryBalance = 0;
	}

/* Admin Functions */
	function updateBeneficiary(address payable _newBeneficiary) public 
	{		
		require(msg.sender == beneficiary);
		beneficiary = _newBeneficiary;
	}
	function setTokenUri(uint256 _tokenId, string memory _newUri) public 
	{
		require(msg.sender == beneficiary);
		_setTokenURI(_tokenId, _newUri);
	}
	function setDefaultMetadata(string memory _newUri) public 
	{
		require(msg.sender == beneficiary);
		//defaultMetadata = _newUri;
		_setBaseURI(_newUri);
	}
	function setAuctionEnded() public
	{
		require(msg.sender == beneficiary);
	}
/* Fallback Functions */
	receive() external payable { }
	fallback() external payable { }

}
