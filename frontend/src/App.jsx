import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import CounterABI from './abis/Counter.json';

// 1. Paste your deployed address here
const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

function App() {
  const [count, setCount] = useState(0);

  useEffect(() => { 
    fetchCount();
  });

  // Helper: Request access to Metamask
  async function requestAccount() {
    await window.ethereum.request({ method: 'eth_requestAccounts' });
  }

  // Read from Blockchain
  async function fetchCount() {
    if (typeof window.ethereum !== 'undefined') {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CounterABI.abi, provider);
      try {
        const data = await contract.getCount();
        setCount(Number(data)); // Convert BigInt to Number
      } catch (err) {
        console.log("Error: ", err);
      }
    }
  }

  // Write to Blockchain (Requires Gas/Signer)
  async function incrementCount() {
    if (typeof window.ethereum !== 'undefined') {
      await requestAccount();
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner(); // Get the user's wallet
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CounterABI.abi, signer);
      
      try {
        const transaction = await contract.inc();
        await transaction.wait(); // Wait for block to be mined
        fetchCount(); // Refresh UI
      } catch (err) {
        console.log("Error: ", err);
      }
    }
  }

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>Counter App</h1>
      <p>Current Count: {count}</p>
      <button onClick={fetchCount}>Refresh Count</button>
      <button onClick={incrementCount} style={{ marginLeft: "10px" }}>Increment</button>
    </div>
  );
}

export default App;