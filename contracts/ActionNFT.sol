// SPDX-License-Identifier: MIT
pragma solidity 0.6.6;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract ActionNFT is ERC721 {

/* Variables */
    address payable private beneficiary;
    uint256 public currentId;

    uint256 public commonPrice;

    uint256 public bidPrice;
    address public topBidder;
    uint256 public lastBidTime;

    bool public auctionEnded = false;
    uint256 public auctionEndTime;
    
    uint256 public treasuryBalance;
    mapping (address => uint256) private withdrawableBalance;

    constructor (
	    address payable _beneficiary, 
	    uint256 _minPrice

    ) public ERC721 ("PACDAO ACTION", "PAC-A1"){
	 
	beneficiary = _beneficiary;
	bidPrice = _minPrice;
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
	currentId += 1;
	_safeMint(msg.sender, currentId);
	
	store_withdrawable(msg.sender, msg.value);

    }
    function old() private {
	    /*
   require(msg.value >= minPrice, "Must pay more");
		currentId += 1;
		_safeMint(msg.sender, currentId);
		_setTokenURI(currentId, defaultMetadata);
		uint _target = minPrice * 1075000000000000000 / 1e18;
		if(_target - minPrice < 1e14) {
			_target = minPrice + 1e14;
		}
		if(currentId < 20) {
			currentId += 1;
			_safeMint(beneficiary, currentId);
			_setTokenURI(currentId, defaultMetadata);
		}

		if(msg.value > _target) {
			minPrice = msg.value + 1e14;
		} else {
			minPrice = _target;
		}
		minPrice = minPrice / 1e14 * 1e14;
	       */
	}
    function bid_rare() public payable
    {
	  require(auctionEnded == false);
	  require(msg.value > bidPrice);
	  bidPrice = bidPrice * 1075000000000000000; 
	  topBidder = msg.sender; 
	  lastBidTime = now;
	  store_withdrawable(msg.sender, msg.value);
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
