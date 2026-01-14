// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;
import {Shop} from "./Shop.sol";
import {ShopDetails} from "./Types.sol";

contract Master {
    address public owner;
    string[] public allShopNames;
    address[] public allShopAddresses;
    mapping(address => address) public shopOwnerRegistry;

    event ShopCreated(address indexed owner, address shopAddress, string name);

    function createShop(ShopDetails memory _shopDetails) external returns (address) {
        Shop newShop = new Shop(_shopDetails);
        address shopAddress = address(newShop);
        allShopNames.push(_shopDetails.shopName);
        allShopAddresses.push(shopAddress);
        shopOwnerRegistry[shopAddress] = msg.sender;
        emit ShopCreated(msg.sender, shopAddress, _shopDetails.shopName);
        return shopAddress;
    }

    // Retrieve all shop names
    function getAllShops() external view returns (string[] memory) {
        return allShopNames;
    }

    // Update shop name
    function updateShopName(
        address _shopAddress,
        string calldata _oldName,
        string calldata _newName
    ) external { 
        require(
            shopOwnerRegistry[_shopAddress] == msg.sender,
            "Only shop owner can update the name"
        ); 

        for (uint256 i = 0; i < allShopNames.length; i++) {
            if (
                keccak256(abi.encodePacked(allShopNames[i])) ==
                keccak256(abi.encodePacked(_oldName))
            ) {
                allShopNames[i] = _newName;
                return;
            }
        }

    }

    // Retrieves the shop address associated with a specific name.
    function getShopByName(
        string calldata _name
    ) external view returns (address) {
        for (uint256 i = 0; i < allShopNames.length; i++) {
            if (
                keccak256(abi.encodePacked(allShopNames[i])) ==
                keccak256(abi.encodePacked(_name))
            ) {
                return allShopAddresses[i];
            }
        }
        revert("Shop not found");
    }

    // Retrieves the shop address associated with a specific user.
    function getShopsByOwner(
        address _owner
    ) external view returns (address[] memory) {
        address[] memory ownedShops = new address[](allShopAddresses.length);
        uint256 count = 0;

        for (uint256 i = 0; i < allShopAddresses.length; i++) {
            if (shopOwnerRegistry[allShopAddresses[i]] == _owner) {
                ownedShops[count] = allShopAddresses[i];
                count++;
            }
        }

        // Create a new array with exact size
        address[] memory result = new address[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = ownedShops[i];
        }

        return result;
    }
}
