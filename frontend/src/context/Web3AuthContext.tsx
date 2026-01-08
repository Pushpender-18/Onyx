'use client';

import React from 'react';
import { type Web3AuthContextConfig } from '@web3auth/modal/react'
import { WEB3AUTH_NETWORK, type Web3AuthOptions } from '@web3auth/modal'

const web3AuthOptions: Web3AuthOptions = {
  clientId: 'BFUtZIGwXk_eDWh6seAY8dUQzWZVvU4Dyn3oJqa3_Ns4LIJ4Xx-rLPPS6l0LBfznH5j_S0lYFlftSxoqQFPB6JM', 
  web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_DEVNET, 
}

const web3AuthContextConfig: Web3AuthContextConfig = {
  web3AuthOptions,
}

export default web3AuthContextConfig;
