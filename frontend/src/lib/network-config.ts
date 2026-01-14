// Environment variables for blockchain connection
export const NETWORK_CONFIG = {
  // Local Hardhat Network
  LOCAL: {
    chainId: 31337,
    chainName: 'Localhost',
    rpcUrl: 'http://127.0.0.1:8545',
    masterContractAddress: '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0',
    blockExplorer: undefined,
  },
  // Mantle Testnet
  MANTLE_TESTNET: {
    chainId: 5003,
    chainName: 'Mantle Testnet',
    rpcUrl: 'https://rpc.sepolia.mantle.xyz',
    masterContractAddress: '0x5FbDB2315678afecb367f032d93F642f64180aa3', // Update with deployed address
    blockExplorer: 'https://explorer.sepolia.mantle.xyz',
  },
  // Mantle Mainnet
  MANTLE_MAINNET: {
    chainId: 5000,
    chainName: 'Mantle',
    rpcUrl: 'https://rpc.mantle.xyz',
    masterContractAddress: '0x5FbDB2315678afecb367f032d93F642f64180aa3', // Update with deployed address
    blockExplorer: 'https://explorer.mantle.xyz',
  },
};

// Current network - change this based on your deployment
export const CURRENT_NETWORK = NETWORK_CONFIG.LOCAL;

// You can also use environment variable
// export const CURRENT_NETWORK = process.env.NEXT_PUBLIC_NETWORK === 'mainnet' 
//   ? NETWORK_CONFIG.MANTLE_MAINNET 
//   : NETWORK_CONFIG.MANTLE_TESTNET;
