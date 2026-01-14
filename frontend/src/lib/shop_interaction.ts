import { ethers } from "ethers";
import Master from "@/abi/Master.json";
import Shop from "@/abi/Shop.json";
import { create } from "domain";
import { CURRENT_NETWORK } from "./network-config";

const MASTER_CONTRACT_ADDRESS = CURRENT_NETWORK.masterContractAddress;
const DUMMY_SHOP_ADDRESS = "0xa16E02E87b7454126E5E10d957A927A7F5B5d2be";

// Check if connected to correct network
// Returns true if on correct network, false otherwise
async function checkAndSwitchNetwork(throwOnWrongNetwork: boolean = false): Promise<boolean> {
	if (typeof window === 'undefined') {
		console.warn('Window object not available. Running on server side.');
		return false;
	}

	const ethereum = (window as any).ethereum;
	if (!ethereum) {
		console.warn('MetaMask or Web3 wallet is not installed');
		return false;
	}

	try {
		// Get current chain ID
		const chainId = await ethereum.request({ method: 'eth_chainId' });
		const currentChainId = parseInt(chainId, 16);

		console.log(` Current chainId: ${currentChainId}, Required: ${CURRENT_NETWORK.chainId}`);

		// Check if on correct network
		if (currentChainId !== CURRENT_NETWORK.chainId) {
			console.log(` Wrong network. Current: ${currentChainId}, Required: ${CURRENT_NETWORK.chainId}`);
			
			// For local network (Hardhat), show a warning
			if (CURRENT_NETWORK.chainId === 31337) {
				console.warn(` Expected local network (31337) but connected to ${currentChainId}.`);
				console.warn(` Please manually switch to Localhost 8545 in MetaMask.`);
				console.warn(` If the network doesn't exist, add it manually:`);
				console.warn(`   - Network Name: Localhost 8545`);
				console.warn(`   - RPC URL: http://127.0.0.1:8545`);
				console.warn(`   - Chain ID: 31337`);
				console.warn(`   - Currency Symbol: ETH`);
				
				if (throwOnWrongNetwork) {
					throw new Error(`Please connect to ${CURRENT_NETWORK.chainName} network (Chain ID: ${CURRENT_NETWORK.chainId})`);
				}
				return false;
			}
			
			try {
				// Try to switch to the correct network
				await ethereum.request({
					method: 'wallet_switchEthereumChain',
					params: [{ chainId: `0x${CURRENT_NETWORK.chainId.toString(16)}` }],
				});
				console.log(` Switched to ${CURRENT_NETWORK.chainName}`);
				return true;
			} catch (switchError: any) {
				console.error('Switch network error:', switchError);
				// Network not added to MetaMask, try to add it
				if (switchError.code === 4902) {
					console.log(`📝 Network not found, attempting to add ${CURRENT_NETWORK.chainName}...`);
					await addNetwork();
					return true;
				} else if (switchError.code === 4001) {
					if (throwOnWrongNetwork) {
						throw new Error('Network switch rejected by user');
					}
					return false;
				} else {
					if (throwOnWrongNetwork) {
						throw switchError;
					}
					return false;
				}
			}
		} else {
			console.log(` Already on correct network: ${CURRENT_NETWORK.chainName}`);
			return true;
		}
	} catch (error: any) {
		console.error('Error checking/switching network:', error);
		
		// Provide more helpful error messages
		if (throwOnWrongNetwork && error.message?.includes('Please connect to')) {
			throw error; // Re-throw our custom error
		}
		
		if (throwOnWrongNetwork) {
			throw new Error(`Network error: ${error.message || 'Please connect to ' + CURRENT_NETWORK.chainName + ' network'}`);
		}
		return false;
	}
}

// Add network to MetaMask
async function addNetwork(): Promise<void> {
	const ethereum = (window as any).ethereum;
	
	try {
		// Determine native currency based on network
		const nativeCurrency = CURRENT_NETWORK.chainId === 31337 
			? { name: 'Ether', symbol: 'ETH', decimals: 18 }
			: { name: 'MNT', symbol: 'MNT', decimals: 18 };

		const networkParams = {
			chainId: `0x${CURRENT_NETWORK.chainId.toString(16)}`,
			chainName: CURRENT_NETWORK.chainName,
			rpcUrls: [CURRENT_NETWORK.rpcUrl],
			nativeCurrency,
			blockExplorerUrls: CURRENT_NETWORK.blockExplorer ? [CURRENT_NETWORK.blockExplorer] : undefined,
		};

		console.log('📝 Adding network with params:', networkParams);

		await ethereum.request({
			method: 'wallet_addEthereumChain',
			params: [networkParams],
		});
		console.log(` Added ${CURRENT_NETWORK.chainName} network to MetaMask`);
	} catch (error: any) {
		console.error('Error adding network:', error);
		
		if (error.code === 4001) {
			throw new Error('Network addition rejected by user');
		}
		
		throw new Error(`Failed to add ${CURRENT_NETWORK.chainName} network to MetaMask: ${error.message}`);
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

// Create and send a transaction to transfer ETH
export async function sendTransaction(receiverAddress: string, amountInEth: number) {
	try {
		console.log('💸 Creating transaction to:', receiverAddress);
		console.log('💰 Amount:', amountInEth, 'ETH');
		
		// Get provider and signer
		const provider = await checkWalletConnection(true); // Require correct network for transactions
		const signer = await provider.getSigner();
		const senderAddress = await signer.getAddress();
		
		console.log('📤 Sending from:', senderAddress);
		
		// Validate receiver address
		if (!ethers.isAddress(receiverAddress)) {
			throw new Error('Invalid receiver address');
		}
		
		// Convert ETH amount to wei
		const amountInWei = ethers.parseUnits(amountInEth.toString(), 18);
		console.log('💰 Amount in wei:', amountInWei.toString());
		
		// Create transaction object
		const tx = {
			to: receiverAddress,
			value: amountInWei
		};
		
		// Send transaction
		console.log('📝 Sending transaction...');
		const txResponse = await signer.sendTransaction(tx);
		console.log('⏳ Transaction sent. Hash:', txResponse.hash);
		console.log('⏳ Waiting for confirmation...');
		
		// Wait for transaction to be mined
		const receipt = await txResponse.wait();
		console.log(' Transaction confirmed! Block:', receipt?.blockNumber);
		
		return {
			success: true,
			txHash: txResponse.hash,
			from: senderAddress,
			to: receiverAddress,
			amount: amountInEth,
			blockNumber: receipt?.blockNumber,
			gasUsed: receipt?.gasUsed.toString()
		};
	} catch (error: any) {
		console.error(' Error sending transaction:', error);
		
		// Provide better error messages
		if (error.code === 'ACTION_REJECTED' || error.code === 4001) {
			throw new Error('Transaction rejected by user');
		} else if (error.message?.includes('insufficient funds')) {
			throw new Error('Insufficient funds to complete transaction');
		} else if (error.message?.includes('Invalid receiver address')) {
			throw new Error('Invalid receiver address');
		}
		
		throw error;
	}
}

// Check if wallet is connected and available
// Set requireCorrectNetwork to true for write operations (create, update, delete)
// Set to false for read operations (get, fetch) to allow viewing data on any network
async function checkWalletConnection(requireCorrectNetwork: boolean = false) {
	if (typeof window === 'undefined') {
		throw new Error('Window object not available. Running on server side.');
	}

	const ethereum = (window as any).ethereum;
	
	if (!ethereum) {
		throw new Error('MetaMask or Web3 wallet is not installed');
	}

	// Check and optionally switch to correct network
	const isOnCorrectNetwork = await checkAndSwitchNetwork(requireCorrectNetwork);
	
	if (requireCorrectNetwork && !isOnCorrectNetwork) {
		throw new Error(`Please connect to ${CURRENT_NETWORK.chainName} network (Chain ID: ${CURRENT_NETWORK.chainId}) to perform this action`);
	}

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

// Returns the Master contract instance
// Set requireCorrectNetwork to true for write operations, false for read operations
async function getMasterContract(requireCorrectNetwork: boolean = false) {
	try {
		const provider = await checkWalletConnection(requireCorrectNetwork);
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

async function getSignerAddress(requireCorrectNetwork: boolean = false) {
	try {
		const provider = await checkWalletConnection(requireCorrectNetwork);
		const signer = await provider.getSigner();
		const address = await signer.getAddress();
		return address;
	} catch (error: any) {
		console.error('Error getting signer address:', error);
		throw new Error(error.message || 'Failed to get wallet address');
	}
}

// Return particular Shop contract instance
async function getShopContract(shopAddress: string, requireCorrectNetwork: boolean = false) {
	try {
		const provider = await checkWalletConnection(requireCorrectNetwork);
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
		const masterContract = await getMasterContract(true); // Require correct network for write operation
		const owner = await getSignerAddress(true);
		const shopDetails = {
			shopName: shopName,
			shopType: templateName,
			description: description,
			configuration: configuration,
			thumbnailIpfsHash: "QmDummyHashForThumbnail",
			owner: owner,
			isPublished: false
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

// Retrieves all shops names (read operation - doesn't require correct network)
export async function getAllShops() {
	try {
		const masterContract = await getMasterContract(false); // Read operation - allow on any network
		const shops = await masterContract.getAllShops();
		console.log('Fetched all shops:', shops);
		return shops;
	} catch (error) {
		console.error('Error fetching all shops:', error);
		throw error;
	}
}

// Retrieves shop details by name (read operation - doesn't require correct network)
export async function getShopDetails(shopName: string) {
	try {
		const masterContract = await getMasterContract(false); // Read operation
		const shopAddress = await masterContract.getShopByName(shopName);
		console.log('Fetched shop address for', shopName, ':', shopAddress);
		return shopAddress;
	} catch (error) {
		console.error('Error fetching shop address:', error);
		throw error;
	}
}

// Retrieves shop details from the Shop contract by address (read operation)
export async function getShopDetailsFromContract(shopAddress: string) {
	try {
		const shopContract = await getShopContract(shopAddress, false); // Read operation
		const shopDetails = await shopContract.shopDetails();
		console.log(' Raw shop details from contract:', shopDetails);
		console.log(' isPublished field:', shopDetails.isPublished, 'or index[6]:', shopDetails[6]);
		
		// Convert the tuple to a more usable object
		const result = {
			shopName: shopDetails.shopName || shopDetails[0],
			shopType: shopDetails.shopType || shopDetails[1],
			description: shopDetails.description || shopDetails[2],
			configuration: shopDetails.configuration || shopDetails[3],
			thumbnailIpfsHash: shopDetails.thumbnailIpfsHash || shopDetails[4],
			owner: shopDetails.owner || shopDetails[5],
			isPublished: shopDetails.isPublished !== undefined ? shopDetails.isPublished : shopDetails[6],
		};
		
		console.log(' Converted shop details:', result);
		return result;
	} catch (error) {
		console.error('Error fetching shop details from contract:', error);
		throw error;
	}
}

// Retrieves the owner address of a shop (read operation - doesn't require correct network)
export async function getShopOwner(shopName: string): Promise<string> {
	try {
		const shopAddress = await getShopDetails(shopName);
		console.log('👤 Fetching owner for shop:', shopAddress);
		const shopContract = await getShopContract(shopAddress, false); // Read operation
		const shopDetails = await shopContract.shopDetails();
		const ownerAddress = shopDetails.owner || shopDetails[5];
		console.log(' Shop owner address:', ownerAddress);
		return ownerAddress;
	} catch (error) {
		console.error(' Error fetching shop owner:', error);
		throw error;
	}
}

// shopAddress to be given during actual usage
// Add Items in the shop (write operation - requires correct network)
export async function addItemToShop(shopAddress: string = DUMMY_SHOP_ADDRESS,
	itemName: string, itemPrice: number, itemStock: number, description: string,
	ipfsHash: string[]) {
	try {
		console.log('🔄 Getting shop contract at:', shopAddress);
		const shopContract = await getShopContract(shopAddress, true); // Write operation - require correct network
		
		const timestamp = Math.floor(Date.now() / 1000).toString(); // Convert to string
		
		const _id = `${timestamp}-${Math.random().toString(36).slice(2)}`; // Generate unique ID for the item

		const _itemDetails = {
			id: _id,
			name: itemName,
			description: description,
			price: ethers.parseUnits(itemPrice.toString(), 18),
			stock: itemStock ? itemStock : 0,
			isActive: true,
			createdAt: timestamp,  // Now a string
			updatedAt: timestamp,  // Now a string
			ipfsHash: ipfsHash
		};

		console.log('📝 Sending transaction to blockchain...');
		console.log('Product details:', _itemDetails);
		
		const tx = await shopContract.addProduct(_itemDetails);
		console.log('⏳ Transaction sent. Hash:', tx.hash);
		console.log('⏳ Waiting for confirmation...');
		
		const receipt = await tx.wait(); // Wait for transaction confirmation
		console.log(' Transaction confirmed! Block:', receipt.blockNumber);
		console.log(' Product added successfully:', itemName);
		
		return { success: true, itemName, shopAddress, txHash: tx.hash };
	} catch (error: any) {
		console.error(' Error adding product:', error);
		
		// Provide better error messages
		if (error.code === 'ACTION_REJECTED' || error.code === 4001) {
			throw new Error('Transaction rejected by user');
		} else if (error.message?.includes('insufficient funds')) {
			throw new Error('Insufficient funds to complete transaction');
		} else if (error.message?.includes('Only owner')) {
			throw new Error('Only the store owner can add products');
		}
		
		throw error;
	}
}

// Update an existing product in the shop (write operation - requires correct network)
export async function updateItemInShop(
	shopAddress: string,
	itemId: string,
	itemName: string,
	itemPrice: number,
	itemStock: number,
	description: string,
	ipfsHash: string[]
) {
	try {
		console.log('🔄 Getting shop contract at:', shopAddress);
		const shopContract = await getShopContract(shopAddress, true); // Write operation - require correct network
		
		// Get all items to find the index of the item we're updating
		console.log('🔍 Finding item index for ID:', itemId);
		const allItems = await shopContract.getAllItems();
		
		let itemIndex = -1;
		for (let i = 0; i < allItems.length; i++) {
			if (allItems[i].id === itemId) {
				itemIndex = i;
				break;
			}
		}
		
		if (itemIndex === -1) {
			throw new Error('Product not found in shop');
		}
		
		console.log('✅ Found item at index:', itemIndex);
		
		const timestamp = Math.floor(Date.now() / 1000).toString(); // Convert to string
		
		const _itemDetails = {
			id: itemId,
			name: itemName,
			description: description,
			price: ethers.parseUnits(itemPrice.toString(), 18),
			stock: itemStock ? itemStock : 0,
			isActive: true,
			createdAt: timestamp,  // Current timestamp
			updatedAt: timestamp,  // Updated timestamp
			ipfsHash: ipfsHash
		};

		console.log('📝 Sending update transaction to blockchain...');
		console.log('Product details:', _itemDetails);
		console.log('Item index:', itemIndex);
		
		const tx = await shopContract.updateProduct(_itemDetails, itemIndex);
		console.log('⏳ Transaction sent. Hash:', tx.hash);
		console.log('⏳ Waiting for confirmation...');
		
		const receipt = await tx.wait(); // Wait for transaction confirmation
		console.log(' Transaction confirmed! Block:', receipt.blockNumber);
		console.log(' Product updated successfully:', itemName);
		
		return { success: true, itemName, shopAddress, txHash: tx.hash };
	} catch (error: any) {
		console.error(' Error updating product:', error);
		
		// Provide better error messages
		if (error.code === 'ACTION_REJECTED' || error.code === 4001) {
			throw new Error('Transaction rejected by user');
		} else if (error.message?.includes('insufficient funds')) {
			throw new Error('Insufficient funds to complete transaction');
		} else if (error.message?.includes('Only owner')) {
			throw new Error('Only the store owner can update products');
		} else if (error.message?.includes('Product not found')) {
			throw new Error('Product not found');
		}
		
		throw error;
	}
}

// shopAddress to be given during actual usage
// Fetch Items from the shop (read operation - doesn't require correct network)
export async function getItemsFromShop(shopAddress: string = DUMMY_SHOP_ADDRESS) {
	try {
		const shopContract = await getShopContract(shopAddress, false); // Read operation
		const items = await shopContract.getAllItems();
		console.log('Fetched items from shop:', items);
		return items;
	} catch (error) {
		console.error('Error fetching items:', error);
		throw error;
	}
}

// Create multiple orders in a single transaction (write operation - requires correct network)
export async function createTransaction(
	shopAddress: string,
	itemIds: string[],
	quantities: number[],
	pricesInEth: number[],
	txnHash: string
) {
	try {
		console.log('🛒 Creating transaction for multiple items');
		console.log(' Item IDs:', itemIds);
		console.log(' Quantities:', quantities);
		console.log('💰 Prices (ETH):', pricesInEth);
		
		// Validate inputs
		if (itemIds.length !== quantities.length || itemIds.length !== pricesInEth.length) {
			throw new Error('Arrays length mismatch: itemIds, quantities, and prices must have the same length');
		}
		
		if (itemIds.length === 0) {
			throw new Error('No items provided');
		}
		
		const shopContract = await getShopContract(shopAddress, true); // Write operation - require correct network
		const provider = await checkWalletConnection(true);
		
		// Convert ETH prices to wei
		const pricesInWei = pricesInEth.map(price => ethers.parseUnits(price.toString(), 18));
		console.log('💰 Prices in wei:', pricesInWei.map(p => p.toString()));
		
		// Get current timestamp as string
		const timestamp = Math.floor(Date.now() / 1000).toString();
		
		// Send transaction
		console.log('📝 Sending transaction to blockchain...');
		const tx = await shopContract.createTransaction(
			itemIds,
			quantities,
			pricesInWei,
			timestamp,
			txnHash
		);
		
		console.log('⏳ Transaction sent. Hash:', tx.hash);
		console.log('⏳ Waiting for confirmation...');
		
		const receipt = await tx.wait();
		console.log(' Transaction confirmed! Block:', receipt.blockNumber);
		console.log(' Orders created successfully!');
		
		return {
			success: true,
			txHash: tx.hash,
			itemIds,
			quantities,
			blockNumber: receipt.blockNumber
		};
	} catch (error: any) {
		console.error(' Error creating transaction:', error);
		
		// Provide better error messages
		if (error.code === 'ACTION_REJECTED' || error.code === 4001) {
			throw new Error('Transaction rejected by user');
		} else if (error.message?.includes('insufficient funds')) {
			throw new Error('Insufficient funds to complete transaction');
		} else if (error.message?.includes('Insufficient stock')) {
			throw new Error('Insufficient stock available for one or more items');
		} else if (error.message?.includes('Product does not exist')) {
			throw new Error('One or more products not found');
		} else if (error.message?.includes('Product is not active')) {
			throw new Error('One or more products are no longer available');
		} else if (error.message?.includes('length mismatch')) {
			throw new Error('Invalid data: arrays length mismatch');
		}
		
		throw error;
	}
}

// Publish a shop (make it live) - write operation requires correct network
export async function publishShop(shopAddress: string) {
	try {
		console.log(' Publishing shop at:', shopAddress);
		
		// Check if contract exists at this address
		const provider = await checkWalletConnection(true);
		const code = await provider.getCode(shopAddress);
		
		if (code === '0x') {
			console.error(' No contract found at address:', shopAddress);
			throw new Error('Store contract not found. The Hardhat node may have been restarted. Please recreate your store.');
		}
		
		const shopContract = await getShopContract(shopAddress, true); // Write operation - require correct network
		const signer = await provider.getSigner();
		const callerAddress = await signer.getAddress();
		
		// Get shop details to verify ownership and publication status
		const shopDetails = await shopContract.shopDetails();
		const ownerAddress = shopDetails.owner;
		const isPublished = shopDetails.isPublished;
		
		console.log('🔑 Caller address:', callerAddress);
		console.log('👤 Owner address:', ownerAddress);
		console.log(' Current published status:', isPublished);
		
		// Verify ownership
		if (callerAddress.toLowerCase() !== ownerAddress.toLowerCase()) {
			throw new Error(`Only the shop owner can publish. Owner: ${ownerAddress}, You: ${callerAddress}`);
		}
		
		// Check if already published
		if (isPublished) {
			throw new Error('Shop is already published');
		}
		
		console.log('📝 Sending publish transaction to blockchain...');
		const tx = await shopContract.publishShop();
		console.log('⏳ Transaction sent. Hash:', tx.hash);
		console.log('⏳ Waiting for confirmation...');
		
		const receipt = await tx.wait();
		console.log(' Transaction confirmed! Block:', receipt.blockNumber);
		console.log(' Shop published successfully!');
		
		return { success: true, txHash: tx.hash, shopAddress };
	} catch (error: any) {
		console.error(' Error publishing shop:', error);
		
		// Provide better error messages based on error type
		if (error.code === 'CALL_EXCEPTION') {
			if (error.message?.includes('missing revert data')) {
				throw new Error('Contract not found at this address. The Hardhat node may have been restarted. Please recreate your store.');
			}
			throw new Error('Transaction failed. The shop may already be published or you may not be the owner.');
		}
		
		if (error.code === 'ACTION_REJECTED' || error.code === 4001) {
			throw new Error('Transaction rejected by user');
		}
		
		if (error.message?.includes('insufficient funds')) {
			throw new Error('Insufficient funds to complete transaction');
		}
		
		if (error.message?.includes('Only owner')) {
			throw new Error('Only the store owner can publish the shop');
		}
		
		if (error.message?.includes('already published')) {
			throw new Error('Shop is already published');
		}
		
		if (error.message?.includes('Store contract not found')) {
			throw error; // Re-throw our custom error with full message
		}
		
		throw error;
	}
}

// Check if shop is published
export async function isShopPublished(shopAddress: string): Promise<boolean> {
	try {
		const shopContract = await getShopContract(shopAddress);
		const isPublished = await shopContract.isShopPublished();
		return isPublished;
	} catch (error) {
		console.error('Error checking if shop is published:', error);
		return false;
	}
}

// Update shop configuration (write operation - requires correct network)
export async function updateShopConfiguration(shopAddress: string, newConfiguration: string, shopName: string) {
    try {
        console.log('🔄 Updating shop configuration at:', shopAddress);
        
        // Check if contract exists at this address
        const provider = await checkWalletConnection(true);
        const code = await provider.getCode(shopAddress);
        
        if (code === '0x') {
            console.error(' No contract found at address:', shopAddress);
            throw new Error('Store contract not found. The Hardhat node may have been restarted. Please recreate your store.');
        }
        
        const shopContract = await getShopContract(shopAddress, true); // Write operation - require correct network
        const signer = await provider.getSigner();
        const callerAddress = await signer.getAddress();
        
        // Get shop details to verify ownership
        const shopDetails = await shopContract.shopDetails();
        const ownerAddress = shopDetails.owner;
        
        console.log('🔑 Caller address:', callerAddress);
        console.log('👤 Owner address:', ownerAddress);
        
        // Verify ownership
        if (callerAddress.toLowerCase() !== ownerAddress.toLowerCase()) {
            throw new Error(`Only the shop owner can update configuration. Owner: ${ownerAddress}, You: ${callerAddress}`);
        }
        
        console.log('📝 Sending update configuration transaction to blockchain...');
        console.log('📋 New configuration:', newConfiguration);
        
        const tx = await shopContract.updateShopConfiguration(newConfiguration, shopName);
        console.log('⏳ Transaction sent. Hash:', tx.hash);
        console.log('⏳ Waiting for confirmation...');
        
        const receipt = await tx.wait();
        console.log(' Transaction confirmed! Block:', receipt.blockNumber);
        console.log(' Shop configuration updated successfully!');
        
        return { success: true, txHash: tx.hash, shopAddress };
    } catch (error: any) {
        console.error(' Error updating shop configuration:', error);
        
        // Provide better error messages based on error type
        if (error.code === 'CALL_EXCEPTION') {
            if (error.message?.includes('missing revert data')) {
                throw new Error('Contract not found at this address. The Hardhat node may have been restarted. Please recreate your store.');
            }
            throw new Error('Transaction failed. You may not be the owner of this shop.');
        }
        
        if (error.code === 'ACTION_REJECTED' || error.code === 4001) {
            throw new Error('Transaction rejected by user');
        }
        
        if (error.message?.includes('insufficient funds')) {
            throw new Error('Insufficient funds to complete transaction');
        }
        
        if (error.message?.includes('Only owner')) {
            throw new Error('Only the store owner can update the configuration');
        }
        
        if (error.message?.includes('Store contract not found')) {
            throw error; // Re-throw our custom error with full message
        }
        
        throw error;
    }
}

// Fetch all orders from a shop and calculate total sales (read operation - doesn't require correct network)
export async function getTotalSalesFromShop(shopAddress: string) {
	try {
		console.log('💰 Fetching total sales from shop at:', shopAddress);
		const shopContract = await getShopContract(shopAddress, false); // Read operation
		
		// Get order count first
		const orderCount = await shopContract.orderCount();
		console.log(' Total orders:', orderCount.toString());
		
		// Fetch all orders and calculate total
		let totalSalesInWei = BigInt(0);
		const orders = [];
		
		for (let i = 0; i < Number(orderCount); i++) {
			const order = await shopContract.orders(i);
			
			// Convert order data to a more usable format
			const orderData = {
				buyer: order.buyer || order[0],
				itemId: order.itemId || order[1],
				quantity: Number(order.quantity || order[2]),
				totalPrice: order.totalPrice || order[3],
				timestamp: order.timestamp || order[4],
				txnHash: order.txnHash || order[5],
			};
			
			orders.push(orderData);
			totalSalesInWei += BigInt(orderData.totalPrice.toString());
		}
		
		// Convert total from wei to ETH
		const totalSalesInEth = Number(ethers.formatUnits(totalSalesInWei.toString(), 18));
		
		console.log(' Total sales (wei):', totalSalesInWei.toString());
		console.log(' Total sales (ETH):', totalSalesInEth);
		
		return {
			totalSalesInWei: totalSalesInWei.toString(),
			totalSalesInEth,
			orderCount: Number(orderCount),
			orders
		};
	} catch (error) {
		console.error(' Error fetching total sales:', error);
		throw error;
	}
}

// Fetch all shops owned by an address and calculate total sales across all shops (read operation)
export async function getTotalSalesForOwner(ownerAddress: string) {
	try {
		console.log('🏪 Fetching all shops for owner:', ownerAddress);
		
		// Validate owner address
		if (!ethers.isAddress(ownerAddress)) {
			throw new Error('Invalid owner address');
		}
		
		// Get master contract to fetch shops by owner
		const masterContract = await getMasterContract(false); // Read operation
		
		// Get all shop addresses owned by this address
		const shopAddresses = await masterContract.getShopsByOwner(ownerAddress);
		console.log(` Found ${shopAddresses.length} shops for owner`);
		
		if (shopAddresses.length === 0) {
			console.log('📭 No shops found for this owner');
			return {
				totalSalesInWei: '0',
				totalSalesInEth: 0,
				totalOrderCount: 0,
				shopCount: 0,
				shopsData: []
			};
		}
		
		// Fetch sales data for each shop
		let overallTotalSalesInWei = BigInt(0);
		let overallTotalOrderCount = 0;
		const shopsData = [];
		
		for (const shopAddress of shopAddresses) {
			try {
				console.log(`📊 Fetching sales for shop: ${shopAddress}`);
				const shopSales = await getTotalSalesFromShop(shopAddress);
				
				// Add to overall totals
				overallTotalSalesInWei += BigInt(shopSales.totalSalesInWei);
				overallTotalOrderCount += shopSales.orderCount;
				
				shopsData.push({
					shopAddress,
					totalSalesInWei: shopSales.totalSalesInWei,
					totalSalesInEth: shopSales.totalSalesInEth,
					orderCount: shopSales.orderCount,
					orders: shopSales.orders
				});
			} catch (error) {
				console.error(` Error fetching sales for shop ${shopAddress}:`, error);
				// Continue with other shops even if one fails
				shopsData.push({
					shopAddress,
					totalSalesInWei: '0',
					totalSalesInEth: 0,
					orderCount: 0,
					orders: [],
					error: 'Failed to fetch sales data'
				});
			}
		}
		
		// Convert total from wei to ETH
		const overallTotalSalesInEth = Number(ethers.formatUnits(overallTotalSalesInWei.toString(), 18));
		
		console.log('✅ Overall totals:');
		console.log(' Total sales (wei):', overallTotalSalesInWei.toString());
		console.log(' Total sales (ETH):', overallTotalSalesInEth);
		console.log(' Total orders:', overallTotalOrderCount);
		console.log(' Total shops:', shopAddresses.length);
		
		return {
			totalSalesInWei: overallTotalSalesInWei.toString(),
			totalSalesInEth: overallTotalSalesInEth,
			totalOrderCount: overallTotalOrderCount,
			shopCount: shopAddresses.length,
			shopsData
		};
	} catch (error) {
		console.error(' Error fetching total sales for owner:', error);
		throw error;
	}
}

