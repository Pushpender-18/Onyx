import {ethers } from "ethers";
import Master from "@/abi/Master.json";
import Shop from "@/abi/Shop.json";

const MASTER_CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const DUMMY_SHOP_ADDRESS = "0xa16E02E87b7454126E5E10d957A927A7F5B5d2be";


// Returns the Master contract instance
async function getMasterContract(signer: any) {
	try {
		// Create contract instance
		const masterContract = new ethers.Contract(
			MASTER_CONTRACT_ADDRESS,
			Master.abi,
			signer
		);

		return masterContract;
	} catch (error: any) {
		console.error('Error getting master contract:', error);
		throw new Error(error.message || 'Failed to connect to Master contract');
	}
}

async function getSignerAddress(signer: any) {
	try {
		const address = await signer.getAddress();
		return address;
	} catch (error: any) {
		console.error('Error getting signer address:', error);
		throw new Error(error.message || 'Failed to get wallet address');
	}
}

// Return particular Shop contract instance
async function getShopContract(shopAddress: string, signer: any) {
	try {

		const shopContract = new ethers.Contract(
			shopAddress,
			Shop.abi,
			signer
		);

		return shopContract;
	} catch (error: any) {
		console.error('Error getting shop contract:', error);
		throw new Error(error.message || 'Failed to connect to Shop contract');
	}
}

// Creates a new shop with the given name and template
export async function createShop(shopName: string, templateName: string, description: string, configuration: string, signer: any) {
	try {
		const masterContract = await getMasterContract(signer);
		const owner = await getSignerAddress(signer);
		const shopDetails = {
			shopName: shopName,
			shopType: templateName,
			description: description,
			configuration: configuration,
			thumbnailIpfsHash: "QmDummyHashForThumbnail",
			owner: owner
		};
		
		const tx = await masterContract.createShop(shopDetails);
		await tx.wait(); // Wait for transaction confirmation
		
		console.log('Shop created successfully:', shopName);
		return { success: true, shopName, owner };
	} catch (error) {
		console.error('Error creating shop:', error);
		throw error;
	}
}

// Retrieves all shops names
export async function getAllShops(signer: any) {
	try {
		const masterContract = await getMasterContract(signer);
		const shops = await masterContract.getAllShops();
		console.log('Fetched all shops:', shops);
		return shops;
	} catch (error) {
		console.error('Error fetching all shops:', error);
		throw error;
	}
}

// Retrieves shop details by name
export async function getShopDetails(shopName: string, signer: any) {
	try {
		const masterContract = await getMasterContract(signer);
		const shopAddress = await masterContract.getShopByName(shopName);
		console.log('Fetched shop address for', shopName, ':', shopAddress);
		return shopAddress;
	} catch (error) {
		console.error('Error fetching shop address:', error);
		throw error;
	}
}

// Retrieves shop details from the Shop contract by address
export async function getShopDetailsFromContract(shopAddress: string, signer: any) {
	try {
		const shopContract = await getShopContract(shopAddress, signer);
		const shopDetails = await shopContract.shopDetails();
		console.log('Fetched shop details from contract:', shopDetails);
		
		// Convert the tuple to a more usable object
		return {
			shopName: shopDetails.shopName || shopDetails[0],
			shopType: shopDetails.shopType || shopDetails[1],
			description: shopDetails.description || shopDetails[2],
			configuration: shopDetails.configuration || shopDetails[3],
			thumbnailIpfsHash: shopDetails.thumbnailIpfsHash || shopDetails[4],
			owner: shopDetails.owner || shopDetails[5],
		};
	} catch (error) {
		console.error('Error fetching shop details from contract:', error);
		throw error;
	}
}

// shopAddress to be given during actual usage
// Add Items in the shop
export async function addItemToShop(shopAddress: string = DUMMY_SHOP_ADDRESS,
	itemName: string, itemPrice: number, itemStock: number, description: string,
	ipfsHash: string[], signer: any) {
	try {
		const shopContract = await getShopContract(shopAddress, signer);
		
		const _itemDetails = {
			id: "genThisLater",
			name: itemName,
			description: description,
			price: ethers.parseUnits(itemPrice.toString(), 18),
			stock: itemStock,
			isActive: true,
			createdAt: Math.floor(Date.now() / 1000),
			updatedAt: Math.floor(Date.now() / 1000),
			ipfsHash: ipfsHash
		};

		const tx = await shopContract.addProduct(_itemDetails);
		await tx.wait(); // Wait for transaction confirmation
		
		console.log('Product added successfully:', itemName);
		return { success: true, itemName, shopAddress };
	} catch (error) {
		console.error('Error adding product:', error);
		throw error;
	}
}

// shopAddress to be given during actual usage
// Fetch Items from the shop
export async function getItemsFromShop(shopAddress: string = DUMMY_SHOP_ADDRESS, signer: any) {
	try {
		const shopContract = await getShopContract(shopAddress, signer);
		const items = await shopContract.getAllItems();
		console.log('Fetched items from shop:', items);
		return items;
	} catch (error) {
		console.error('Error fetching items:', error);
		throw error;
	}
}