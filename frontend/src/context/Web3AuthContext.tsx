'use client';

import React from 'react';
import { type Web3AuthContextConfig } from '@web3auth/modal/react'
import { CHAIN_NAMESPACES, WEB3AUTH_NETWORK, type Web3AuthOptions } from '@web3auth/modal'


const web3AuthOptions: Web3AuthOptions = {
  clientId: 'BFUtZIGwXk_eDWh6seAY8dUQzWZVvU4Dyn3oJqa3_Ns4LIJ4Xx-rLPPS6l0LBfznH5j_S0lYFlftSxoqQFPB6JM', 
  web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_DEVNET, 
  chains: [
    {
      logo: "",
      chainNamespace: CHAIN_NAMESPACES.EIP155,
      chainId: '0x7a69', 
      rpcTarget: 'http://127.0.0.1:8545', // Replace with your Infura project ID
      displayName: 'Local Hardhat',
      blockExplorerUrl: '',
      ticker: 'ETH',
      tickerName: 'Ethereum',
    }
  ],
}

const web3AuthContextConfig: Web3AuthContextConfig = {
  web3AuthOptions,
}

export default web3AuthContextConfig;
