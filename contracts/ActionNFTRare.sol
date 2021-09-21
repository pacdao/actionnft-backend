// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import './imports.sol';

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

  string public rareUrl = 'ipfs://QmTfWFpYVd95X4xfbyWU11VXK2U5KeWdXpFxoDHLVMVvN9';
  constructor(address payable _beneficiary, uint256 _bidUnits)
    ERC721('PACDAO ACTION NFT RARE', 'PAC-A1-RARE')
  {
    beneficiary = _beneficiary;
    bidUnits = _bidUnits;

  }

  /* Bid */

  function bidRare() public payable {
    require(auctionEnded == false, "Auction over");
    require(msg.value / bidUnits * bidUnits == msg.value, "Bid units");
    require(msg.value > 0, "No bid value");
    bids[msg.sender] += msg.value;
    lastBidTime = block.timestamp;

    if(isTopBidder(msg.sender)) {
        reshuffleTopBidder(msg.sender, bids[msg.sender]);
    } else  {
    	updateHighestBidder(msg.sender, bids[msg.sender]);
    }
    withdrawableBalance[msg.sender] += msg.value;
   }

  function reshuffleTopBidder(address addr, uint256 currentValue) internal {
    uint256 _i = 0;
    for (_i; _i < 5; _i++) {
      if (topBidders[_i].addr == addr) {
        break;
      }
    }
    uint256 _j = _i;
    for (_j; _j > 0; _j--) {
      if (topBidders[_j - 1].balance < currentValue) {
        (topBidders[_j].balance, topBidders[_j - 1].balance) = (
          topBidders[_j - 1].balance,
          topBidders[_j].balance
        );
        (topBidders[_j].addr, topBidders[_j - 1].addr) = (
          topBidders[_j - 1].addr,
          topBidders[_j].addr
        );
      }
    }
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


  function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_exists(tokenId), "ERC721Metadata: URI query for nonexistent token");
	return(rareUrl);
  }


  /* Admin Functions */

  function withdrawTreasury() public {
    require(auctionEnded == true, "Auction ongoing");
    require(block.timestamp > auctionEndTime + withdrawWindow, "Withdraw window");
    beneficiary.transfer(address(this).balance);
  }


  function updateBeneficiary(address payable _newBeneficiary) public {
    require(msg.sender == beneficiary);
    beneficiary = _newBeneficiary;
  }

  function setTokenUri(string memory _newUri) public {
    require(msg.sender == beneficiary);
    rareUrl = _newUri;
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



