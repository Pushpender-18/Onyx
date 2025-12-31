// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

contract Master {
	address public owner;
	address[] public allShops;
	mapping(address => address) public shopOwnerRegistry;

	event ShopCreated(address indexed owner, address shopAddress, string name);

	function createShop(string calldata _name ) external returns (address) {
		// Deploys a new Shop contract and registers it.
	}

	function getShopByName(string calldata _name) external view returns (address) {
		// Retrieves the shop address associated with a specific name.
	}

	function getShopsByOwner(address _owner) external view returns (address[] memory) {
		// Retrieves the shop address associated with a specific user.
	}
 }