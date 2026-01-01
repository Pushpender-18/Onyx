import { ethers } from "ethers";
import Master from "@/abi/Master.json";
import Shop from "@/abi/Shop.json";

const MASTER_CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const DUMMY_SHOP_ADDRESS = "0xa16E02E87b7454126E5E10d957A927A7F5B5d2be";

// Note: provider and signer to be fetched during login
// Returns the Master contract instance
async function getMasterContract() {
	const provider = new ethers.BrowserProvider((window as any).ethereum)
	const signer = await provider.getSigner();

	// Create contract instance
	const masterContract = new ethers.Contract(
		MASTER_CONTRACT_ADDRESS,
		Master.abi,
		signer
	);

	return masterContract;
}

// Return particular Shop contract instance
async function getShopContract(shopAddress: string) {
	const provider = new ethers.BrowserProvider((window as any).ethereum)
	const signer = await provider.getSigner();

	const shopContract = new ethers.Contract(
		shopAddress,
		Shop.abi,
		signer
	);

	return shopContract;
}

// Creates a new shop with the given name and template
export async function createShop(shopName: string, templateName: string, description: string, configuration: string) {
	const masterContract = await getMasterContract();

	const response = await masterContract.createShop(shopName, templateName, description, configuration);

	return response.data;

}

// Retrieves all shops names
export async function getAllShops() {
	const masterContract = await getMasterContract();
	
	const shops = await masterContract.getAllShops();
	return shops;
}

// Retrieves shop details by name
export async function getShopDetails(shopName: string) {
	const masterContract = await getMasterContract();
	
	const shopDetails = await masterContract.getShopByName(shopName);
	return shopDetails;
}

// shopAddress to be given during actual usage
// Add Items in the shop
export async function addItemToShop(shopAddress: string = DUMMY_SHOP_ADDRESS, itemName: string, itemPrice: number, itemStock: number) {
	const shopContract = await getShopContract(shopAddress);

	const response = await shopContract.addProduct(ethers.parseUnits(itemPrice.toString(), 18),
					 itemStock, itemName, "IPFS Hash");

	return response;
}

// shopAddress to be given during actual usage
// Fetch Items from the shop
export async function getItemsFromShop(shopAddress: string = DUMMY_SHOP_ADDRESS) {
	const shopContract = await getShopContract(shopAddress);

	const items = await shopContract.getAllItems();

	console.log(items);

	return items;
}