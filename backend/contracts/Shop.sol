// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

struct Item {
	string name;
	uint256 price; // Price in wei
	uint256 stock;
	bool isActive;
	string ipfsHash; // IPFS hash for item image or metadata
}

struct Order {
	address buyer;
	uint256 itemId;
	uint256 quantity;
	uint256 totalPrice; // Total price in wei
	uint256 timestamp;
	bool isDelivered;
}

contract Shop {
	address public owner;
	uint256 public productCount;
	uint256 public orderCount;
	mapping(uint256 => Item) public items;
	mapping(uint256 => Order) public orders;

	// Adds a new product to the shop.
	function addProduct(uint256 _price, uint256 _stock, string calldata _name, string calldata _ipfsHash) external {
		require(msg.sender == owner, "Only owner can add products");
	}	

	// Remove a product from the shop.
	function removeProduct(uint256 _itemId) external {
		require(msg.sender == owner, "Only owner can remove products");
	}

	// Update product details.
	function updateProduct(uint256 _itemId, uint256 _newPrice, uint256 _newStock, bool _isActive, string calldata _newIpfsHash) external {
		require(msg.sender == owner, "Only owner can update products");
	}

	// Update stock for a product.
	function updateStock(uint256 _itemId, uint256 _newStock) external {
		require(msg.sender == owner, "Only owner can update stock");
	}

	// Creates a new order for a product.
	function createTransaction() external {
	}
}