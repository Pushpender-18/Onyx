import { ethers } from "ethers";
import Master from "@/abi/Master.json";
import Shop from "@/abi/Shop.json";
import { create } from "domain";
import { CURRENT_NETWORK } from "./network-config";

const MASTER_CONTRACT_ADDRESS = CURRENT_NETWORK.masterContractAddress;
const DUMMY_SHOP_ADDRESS = "0xa16E02E87b7454126E5E10d957A927A7F5B5d2be";

// Check if connected to correct network
async function checkAndSwitchNetwork(): Promise<void> {
	if (typeof window === 'undefined') {
		throw new Error('Window object not available. Running on server side.');
	}

	const ethereum = (window as any).ethereum;
	if (!ethereum) {
		throw new Error('MetaMask or Web3 wallet is not installed');
	}

	try {
		// Get current chain ID
		const chainId = await ethereum.request({ method: 'eth_chainId' });
		const currentChainId = parseInt(chainId, 16);

		// Check if on correct network
		if (currentChainId !== CURRENT_NETWORK.chainId) {
			console.log(`⚠️ Wrong network. Current: ${currentChainId}, Required: ${CURRENT_NETWORK.chainId}`);
			
			try {
				// Try to switch to the correct network
				await ethereum.request({
					method: 'wallet_switchEthereumChain',
					params: [{ chainId: `0x${CURRENT_NETWORK.chainId.toString(16)}` }],
				});
				console.log(`✅ Switched to ${CURRENT_NETWORK.chainName}`);
			} catch (switchError: any) {
				// Network not added to MetaMask, try to add it
				if (switchError.code === 4902) {
					await addNetwork();
				} else {
					throw switchError;
				}
			}
		}
	} catch (error: any) {
		console.error('Error checking/switching network:', error);
		throw new Error(`Please connect to ${CURRENT_NETWORK.chainName} network`);
	}
}

// Add network to MetaMask
async function addNetwork(): Promise<void> {
	const ethereum = (window as any).ethereum;
	
	try {
		await ethereum.request({
			method: 'wallet_addEthereumChain',
			params: [{
				chainId: `0x${CURRENT_NETWORK.chainId.toString(16)}`,
				chainName: CURRENT_NETWORK.chainName,
				rpcUrls: [CURRENT_NETWORK.rpcUrl],
				nativeCurrency: {
					name: 'MNT',
					symbol: 'MNT',
					decimals: 18,
				},
				blockExplorerUrls: CURRENT_NETWORK.blockExplorer ? [CURRENT_NETWORK.blockExplorer] : undefined,
			}],
		});
		console.log(`✅ Added ${CURRENT_NETWORK.chainName} network to MetaMask`);
	} catch (error: any) {
		console.error('Error adding network:', error);
		throw new Error(`Failed to add ${CURRENT_NETWORK.chainName} network to MetaMask`);
	}
}

// Export function to get current network info
export async function getCurrentNetwork() {
	if (typeof window === 'undefined' || !(window as any).ethereum) {
		return null;
	}

	try {
		const ethereum = (window as any).ethereum;
		const chainId = await ethereum.request({ method: 'eth_chainId' });
		const currentChainId = parseInt(chainId, 16);
		
		return {
			chainId: currentChainId,
			isCorrectNetwork: currentChainId === CURRENT_NETWORK.chainId,
			expectedNetwork: CURRENT_NETWORK.chainName,
			expectedChainId: CURRENT_NETWORK.chainId,
		};
	} catch (error) {
		console.error('Error getting current network:', error);
		return null;
	}
}

// Export utility function to check if wallet is available
export async function isWalletConnected(): Promise<boolean> {
	if (typeof window === 'undefined') {
		return false;
	}
	
	const ethereum = (window as any).ethereum;
	if (!ethereum) {
		return false;
	}
	
	try {
		const accounts = await ethereum.request({ method: 'eth_accounts' });
		return accounts && accounts.length > 0;
	} catch (error) {
		console.error('Error checking wallet connection:', error);
		return false;
	}
}

// Export utility function to request wallet connection
export async function connectWallet(): Promise<boolean> {
	if (typeof window === 'undefined') {
		return false;
	}
	
	const ethereum = (window as any).ethereum;
	if (!ethereum) {
		alert('Please install MetaMask or another Web3 wallet');
		return false;
	}
	
	try {
		const accounts = await ethereum.request({ 
			method: 'eth_requestAccounts' 
		});
		return accounts && accounts.length > 0;
	} catch (error: any) {
		console.error('Error connecting wallet:', error);
		if (error.code === 4001) {
			console.log('User rejected the connection request');
		}
		return false;
	}
}

// Check if wallet is connected and available
async function checkWalletConnection() {
	if (typeof window === 'undefined') {
		throw new Error('Window object not available. Running on server side.');
	}

	const ethereum = (window as any).ethereum;
	
	if (!ethereum) {
		throw new Error('MetaMask or Web3 wallet is not installed');
	}

	// Check and switch to correct network
	await checkAndSwitchNetwork();

	// Check if MetaMask is unlocked
	try {
		const isUnlocked = await ethereum._metamask?.isUnlocked();
		if (isUnlocked === false) {
			throw new Error('MetaMask is locked. Please unlock your wallet.');
		}
	} catch (err) {
		console.warn('Could not check MetaMask unlock status:', err);
	}

	// Create provider with error handling
	let provider;
	try {
		provider = new ethers.BrowserProvider(ethereum, 'any');
	} catch (error: any) {
		console.error('Error creating provider:', error);
		throw new Error('Failed to connect to wallet provider');
	}
	
	try {
		// Check if already connected by checking accounts
		const accounts = await ethereum.request({ 
			method: 'eth_accounts' 
		});
		
		if (!accounts || accounts.length === 0) {
			throw new Error('Wallet not connected. Please connect your wallet first.');
		}
		
		return provider;
	} catch (error: any) {
		console.error('Error checking wallet connection:', error);
		
		if (error.code === -32002) {
			throw new Error('Wallet connection request already pending. Please check your wallet.');
		}
		if (error.code === 4001) {
			throw new Error('Wallet connection rejected by user.');
		}
		if (error.message) {
			throw error;
		}
		throw new Error('Failed to check wallet connection');
	}
}

// Note: provider and signer to be fetched during login
// Returns the Master contract instance
async function getMasterContract() {
	try {
		const provider = await checkWalletConnection();
		const signer = await provider.getSigner();

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

async function getSignerAddress() {
	try {
		const provider = await checkWalletConnection();
		const signer = await provider.getSigner();
		const address = await signer.getAddress();
		return address;
	} catch (error: any) {
		console.error('Error getting signer address:', error);
		throw new Error(error.message || 'Failed to get wallet address');
	}
}

// Return particular Shop contract instance
async function getShopContract(shopAddress: string) {
	try {
		const provider = await checkWalletConnection();
		const signer = await provider.getSigner();

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
export async function createShop(shopName: string, templateName: string, description: string, configuration: string) {
	try {
		const masterContract = await getMasterContract();
		const owner = await getSignerAddress();
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
export async function getAllShops() {
	try {
		const masterContract = await getMasterContract();
		const shops = await masterContract.getAllShops();
		console.log('Fetched all shops:', shops);
		return shops;
	} catch (error) {
		console.error('Error fetching all shops:', error);
		throw error;
	}
}

// Retrieves shop details by name
export async function getShopDetails(shopName: string) {
	try {
		const masterContract = await getMasterContract();
		const shopAddress = await masterContract.getShopByName(shopName);
		console.log('Fetched shop address for', shopName, ':', shopAddress);
		return shopAddress;
	} catch (error) {
		console.error('Error fetching shop address:', error);
		throw error;
	}
}

// Retrieves shop details from the Shop contract by address
export async function getShopDetailsFromContract(shopAddress: string) {
	try {
		const shopContract = await getShopContract(shopAddress);
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
	ipfsHash: string[]) {
	try {
		const shopContract = await getShopContract(shopAddress);
		
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
export async function getItemsFromShop(shopAddress: string = DUMMY_SHOP_ADDRESS) {
	try {
		const shopContract = await getShopContract(shopAddress);
		const items = await shopContract.getAllItems();
		console.log('Fetched items from shop:', items);
		return items;
	} catch (error) {
		console.error('Error fetching items:', error);
		throw error;
	}
}