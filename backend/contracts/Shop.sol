// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

struct Item {
	string id;
	string name;
	string description;
	uint256 price; // Price in wei
	uint256 stock;
	bool isActive;
	string createdAt;
	string updatedAt;
	string[] ipfsHash; // IPFS hash for item image or metadata
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
	string public shopName;
	string public shopType;
	string public thumbnailIpfsHash;
	string public description;
	string public configuration; // JSON format for shop configuration
	mapping(uint256 => Item) public items;
	mapping(uint256 => Order) public orders;

	// Shop constuctor
	constructor(string memory _name, string memory _shopType, 
				string memory _description, string memory _configuration, 
				string memory _thumbnailIpfsHash, address _owner) {
		owner = _owner;
		shopName = _name;
		shopType = _shopType;
		description = _description;
		configuration = _configuration;
		thumbnailIpfsHash = _thumbnailIpfsHash;
		productCount = 0;
		orderCount = 0;
	}

	// Adds a new product to the shop.
	function addProduct(string calldata _uuid, string calldata _name, 
						string calldata _description, uint256 _price,
						uint256 _stock, string calldata _currentDate,
						string[] calldata _ipfsHash) external {
		require(msg.sender == owner, "Only owner can add products"); // Access control [Only the shop owner can add products]
		// Add item in the array
		items[productCount] = Item({
			id: _uuid,
			name: _name,
			description: _description,
			price: _price,
			stock: _stock,
			isActive: true,
			createdAt: _currentDate,
			updatedAt: _currentDate,
			ipfsHash: _ipfsHash
		});
		// Increment product count
		productCount++;
	}	

	// For now itemId is the index in the items mapping
	// Remove a product from the shop.
	function removeProduct(uint256 _itemId, string memory _currentDate) external {
		require(msg.sender == owner, "Only owner can remove products");	// Access control [Only the shop owner can remove products]
		require(_itemId < productCount, "Product does not exist");		// Validity check
		require(items[_itemId].isActive, "Product already removed");	// Check if product is already inactive
		items[_itemId].isActive = false;
		items[_itemId].updatedAt = _currentDate;
		// For now the product is just marked inactive.
		// Space on the chain is still occupied.
	}

	// Update product details.
	function updateProduct(uint256 _itemId, uint256 _newPrice, uint256 _newStock, bool _isActive, string[] calldata _newIpfsHash, string calldata _currentDate) external {
		require(msg.sender == owner, "Only owner can update products");	// Access control [Only the shop owner can update products]
		require(_itemId < productCount, "Product does not exist");		// Validity check
		
		items[_itemId].price = _newPrice;
		items[_itemId].stock = _newStock;
		items[_itemId].isActive = _isActive;
		items[_itemId].ipfsHash = _newIpfsHash;
		items[_itemId].updatedAt = _currentDate;
	}

	// Update stock for a product.
	function updateStock(uint256 _itemId, uint256 _newStock, string calldata _currentDate) external {
		require(msg.sender == owner, "Only owner can update stock");	// Access control [Only the shop owner can update stock]
		require(_itemId < productCount, "Product does not exist");		// Validity check
		items[_itemId].stock = _newStock;
		items[_itemId].updatedAt = _currentDate;
	}

	// Creates a new order for a product.
	function createTransaction() external {
		// Implementation pending
	}

	// Return product count
	function getProductCount() external view returns (uint256) {
		return productCount;
	}

	// Returns total sales value
	function getTotalSales() external view returns (uint256) {
		uint256 totalSales = 0;
		for (uint256 i = 0; i < orderCount; i++) {
			totalSales += orders[i].totalPrice;
		}
		return totalSales;
	}

	// Returns all items in the shop
	function getAllItems() external view returns (Item[] memory) {
		Item[] memory itemList = new Item[](productCount);
		for (uint256 i = 0; i < productCount; i++) {
			itemList[i] = items[i];
		}
		return itemList;
	}
}