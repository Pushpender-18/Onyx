// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import {ShopDetails, Item, Order} from "./Types.sol";

contract Shop {
	ShopDetails public shopDetails;
	uint256 public productCount;
	uint256 public orderCount;
	mapping(uint256 => Item) public items;
	mapping(uint256 => Order) public orders;

	// Shop constuctor
	constructor(ShopDetails memory _shopDetails) {
		shopDetails = _shopDetails;
		productCount = 0;
		orderCount = 0;
	}

	// Update Shop UI Configuration
	function updateShopConfiguration(string memory _newConfig, string memory _shopName) external {
		require(msg.sender == shopDetails.owner, "Only owner can update shop configuration"); // Access control [Only the shop owner can update configuration]
		shopDetails.configuration = _newConfig;
		shopDetails.shopName = _shopName;
	}

	// Return shop details
	function getShopDetails() external view returns (ShopDetails memory) {
		return shopDetails;
	}

	// Adds a new product to the shop.
	function addProduct(Item memory _item) external {
		require(msg.sender == shopDetails.owner, "Only owner can add products"); // Access control [Only the shop owner can add products]
		// Add item in the array
		items[productCount] = Item({
			id: _item.id,
			name: _item.name,
			description: _item.description,
			price: _item.price,
			stock: _item.stock,
			isActive: _item.isActive,
			createdAt: _item.createdAt,
			updatedAt: _item.updatedAt,
			ipfsHash: new string[](_item.ipfsHash.length)
		});

		for (uint i = 0; i < _item.ipfsHash.length; i++) {
			items[productCount].ipfsHash[i] = _item.ipfsHash[i];
		}

		// Increment product count
		productCount++;
	}	

	// For now itemId is the index in the items mapping
	// Remove a product from the shop.
	function removeProduct(uint256 _itemId, string memory _currentDate) external {
		require(msg.sender == shopDetails.owner, "Only owner can remove products");	// Access control [Only the shop owner can remove products]
		require(_itemId < productCount, "Product does not exist");		// Validity check
		require(items[_itemId].isActive, "Product already removed");	// Check if product is already inactive
		items[_itemId].isActive = false;
		items[_itemId].updatedAt = _currentDate;
		// For now the product is just marked inactive.
		// Space on the chain is still occupied.
	}

	// Update product details.
	function updateProduct(Item memory _item, uint256 _itemIndex) external {
		require(msg.sender == shopDetails.owner, "Only owner can update products");	// Access control [Only the shop owner can update products]
		require(_itemIndex < productCount, "Product does not exist");		// Validity check
		
		items[_itemIndex].price = _item.price;
		items[_itemIndex].stock = _item.stock;
		items[_itemIndex].isActive = _item.isActive;
		items[_itemIndex].updatedAt = _item.updatedAt;
		items[_itemIndex].ipfsHash = new string[](_item.ipfsHash.length);
		for (uint i = 0; i < _item.ipfsHash.length; i++) {
			items[_itemIndex].ipfsHash[i] = _item.ipfsHash[i];
		}
	}

	// Update stock for a product.
	function updateStock(uint256 _itemId, uint256 _newStock, string calldata _currentDate) external {
		require(msg.sender == shopDetails.owner, "Only owner can update stock");	// Access control [Only the shop owner can update stock]
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

	// Publish the shop (make it live)
	function publishShop() external {
		require(msg.sender == shopDetails.owner, "Only owner can publish shop");
		require(!shopDetails.isPublished, "Shop is already published");
		shopDetails.isPublished = true;
	}

	// Unpublish the shop (take it offline)
	function unpublishShop() external {
		require(msg.sender == shopDetails.owner, "Only owner can unpublish shop");
		require(shopDetails.isPublished, "Shop is not published");
		shopDetails.isPublished = false;
	}

	// Check if shop is published
	function isShopPublished() external view returns (bool) {
		return shopDetails.isPublished;
	}
}