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

struct ShopDetails {
	string shopName;
	string shopType;
	string description;
	string configuration; // JSON format for shop configuration
	string thumbnailIpfsHash;
	address owner;
}