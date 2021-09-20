// SPDX-License-Identifier: MIT
pragma solidity 0.8.7;

import '@openzeppelin/contracts/token/ERC721/ERC721.sol';
import '@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol';

contract ActionNFTRare is ERC721Enumerable {
  /* Variables */
  address payable private beneficiary;

  /* Rare NFT */
  uint256 public bidUnits;
  uint256 public lastBidTime;

  mapping(address => uint256) public bids;
  mapping(address => uint256) public withdrawableBalance;
  struct TopBid {
    uint256 balance;
    address addr;
  }
  TopBid[5] public topBidders;

  bool public auctionEnded = false;
  uint256 public auctionEndTime;
  uint256 public withdrawWindow = 24 * 60 * 60 * 30;


  constructor(address payable _beneficiary, uint256 _bidUnits)
    ERC721('PACDAO ACTION NFT RARE', 'PAC-A1-RARE')
  {
    beneficiary = _beneficiary;
    bidUnits = _bidUnits;

    // _setBaseURI('ipfs://QmcnEZQiGVzPonWS2MENbdY8DkwhWcCW7YBQNk5yHYF112');
  }

  /* Bid */

  function bidRare() public payable {
    require(auctionEnded == false, "Auction over");
    require(msg.value / bidUnits * bidUnits == msg.value, "Bid units");
    bids[msg.sender] += msg.value;
    lastBidTime = block.timestamp;
    updateHighestBidder(msg.sender, bids[msg.sender]);

    withdrawableBalance[msg.sender] += msg.value / 10 * 9;
   }


  function updateHighestBidder(address addr, uint256 currentValue) internal {
    uint256 i = 0;
    /** get the index of the current max element **/
    for (i; i < topBidders.length; i++) {
      if (topBidders[i].balance < currentValue) {
        break;
      }
    }
    /** shift the array of position (getting rid of the last element) **/
    for (uint256 j = topBidders.length - 1; j > i; j--) {
      topBidders[j].balance = topBidders[j - 1].balance;
      topBidders[j].addr = topBidders[j - 1].addr;
    }
    /** update the new max element **/
    if(i < topBidders.length) {
            topBidders[i].balance = currentValue;
            topBidders[i].addr = addr;
    }
  }

  function isTopBidder(address winner) public view returns (bool) {
    for (uint256 _i = 0; _i < 5; _i++) {
      if (topBidders[_i].addr == winner) {
        return true;
      }
    }
    return false;
  }

  /* Withdraw Functions */
  function withdraw() public {
    require(auctionEnded == true, "Auction not ended");
    require(block.timestamp <= auctionEndTime + withdrawWindow, "Withdraw window ended");
    require(isTopBidder(msg.sender) == false, "Winners cannot withdraw");

    uint256 _val = withdrawableBalance[msg.sender];

    withdrawableBalance[msg.sender] = 0;
    payable(msg.sender).transfer(_val);
  }

  function withdrawTreasury() public {
    require(auctionEnded == true, "Auction ongoing");
    require(block.timestamp > auctionEndTime + withdrawWindow, "Withdraw window");
    beneficiary.transfer(address(this).balance);
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

  function setAuctionEnded() public {
    require(msg.sender == beneficiary);
    auctionEnded = true;
    auctionEndTime = block.timestamp;
    for (uint256 _i = 0; _i < topBidders.length; _i++) {
      _safeMint(topBidders[_i].addr, _i);
    }
  }



  /* Fallback Functions */
  receive() external payable {}

  fallback() external payable {}
}
