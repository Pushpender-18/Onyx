<div align="center">
  <img width="200" alt="Onyx Logo" src="https://github.com/user-attachments/assets/your-logo-link-here" />
  <p>Independent E-Commerce made easy. Powered by <b>Mantle</b></p>

<br/>
<p align="center">
  <img src="https://img.shields.io/github/last-commit/Pushpender-18/Onyx?label=Last%20Commit&logo=git" alt="Last Commit" />
  <img src="https://img.shields.io/badge/Hackathon-Mantle_Global-purple" alt="Hackathon" />
  <img src="https://img.shields.io/badge/status-Prototype-orange" alt="Status" />
  <img src="https://img.shields.io/badge/version-0.1.0-blue" alt="Version" />
  <img src="https://img.shields.io/badge/Mainnet-Coming_Soon-lightgrey" alt="Stability" />
  <br/>
  <img src="https://img.shields.io/badge/-Solidity-363636?logo=solidity&logoColor=white" alt="Solidity" />
  <img src="https://img.shields.io/badge/-NextJS-000000?logo=nextdotjs&logoColor=white" alt="NextJS" />
  <img src="https://img.shields.io/badge/-IPFS-65C2CB?logo=ipfs&logoColor=white" alt="IPFS" />
</p>

<p align="center">
  <img src="https://user-images.githubusercontent.com/74038190/212284100-561aa473-3905-4a80-b561-0d28506553ee.gif" alt="Animated Line" width="90%" />
</p>
</div>

### 📌 Submitted for Mantle Global Hackathon 2025
Onyx is a decentralized, **no-code e-commerce builder** that allows anyone—regardless of technical background—to launch a fully functional, self-owned storefront on the blockchain. By leveraging the Mantle Network, Onyx provides a high-speed, low-gas alternative to traditional Web2 platforms.

## Live Demos & Deliverables
- **Demo Video:** [Watch on YouTube](YOUR_YOUTUBE_LINK)
- **Live dApp:** [Launch Onyx](YOUR_VERCEL_OR_IPFS_LINK)
- **Pitch Deck:** [View Presentation](YOUR_SLIDES_LINK)

---

## 🎯 Objective

### What problem does Onyx solve?
The barrier to entry for Web3 commerce is too high. Currently, if a small business owner wants to sell products on-chain, they need to understand smart contracts, wallet integrations, and complex deployment scripts. This "knowledge gap" keeps the decentralized marketplace restricted to developers. 

Onyx removes this roadblock by providing a **visual, no-code interface** for store creation. We handle the Solidity and IPFS storage in the background so you can focus on your business.

### Who does it serve?
* **Independent Creators:** Artists and makers who want to own their marketplace without paying high platform fees.
* **Non-Tech Merchants:** Small business owners transitioning from Web2 (Shopify/Etsy) to Web3.
* **Privacy-Conscious Sellers:** Users who want to manage their customer data and revenue without a centralized middleman.

### Real-World Use Case:
Meet **Sarah**, a local pottery artist. She wants to sell her vases for $MNT but has zero coding experience. 
1. Sarah connects her wallet to **Onyx**.
2. She clicks **"Create Store"** and picks her brand colors.
3. She uploads photos of her vases (instantly stored on **IPFS**).
4. She hits **"Publish"**. 
In 2 minutes, Sarah has a live, decentralized storefront where customers can buy her art directly—no middleman, no coding, and extremely low gas fees thanks to Mantle.

---

## 🧠 Our Approach

### **How we solved this:**
1.  **Factory Pattern Architecture:** We used a Smart Contract Factory pattern in Solidity. When a user "creates" a store, our main contract deploys a new, unique storefront instance for them.
2.  **No-Code Customization:** Our NextJS frontend provides a "Builder Mode" where users can customize the UI. These configurations are stored as metadata, making the store truly theirs.
3.  **Decentralized Storage:** All product images and shop descriptions are hosted on IPFS. This ensures the store is permanent and censorship-resistant.
4.  **Mantle Network Integration:** We chose Mantle for its modular architecture, ensuring that even as the store grows, gas costs for adding new products remain negligible for the merchant.

### ✨ Key Features
- ✅ **Self-Owned Infrastructure:** You own the contract, you own the store.
- ✅ **Zero-Code Builder:** Drag-and-drop style configuration for your storefront.
- ✅ **Cheap Gas Consumption:** Optimized Solidity code specifically for the Mantle ecosystem.
- ✅ **Instant Settlements:** Funds go directly from the customer to the merchant’s wallet.

---

## 🛠️ Tech Stack

### Frontend & UI:
- **Framework:** Next.js (TypeScript)
- **Styling:** Tailwind CSS
- **Wallet Connection:** Wagmi / RainbowKit

### Backend & Blockchain:
- **Smart Contracts:** Solidity
- **Network:** Mantle Testnet/Mainnet
- **Storage:** IPFS (via Pinata/Web3.Storage)
- **Development Environment:** Hardhat / Foundry

---

## 🏗️ The "Magic" Workflow

1.  **Connect:** User signs in with a Mantle-compatible wallet.
2.  **Deploy:** User clicks "Create Store," triggering a contract deployment via the Onyx Factory.
3.  **Customize:** User edits the theme, store name, and layout in the dashboard.
4.  **Inventory:** User adds products (metadata + images) which are pinned to IPFS.
5.  **Publish:** The store is live! A unique URL is generated for the merchant to share.

---

## 🧪 Project Status

| Feature                | Status                                                                  |
|------------------------|-------------------------------------------------------------------------|
| Store Deployment (Mantle)| ![Working](https://img.shields.io/badge/status-working-brightgreen)    |
| IPFS Image Uploads     | ![Working](https://img.shields.io/badge/status-working-brightgreen)    |
| UI Customization       | ![In Progress](https://img.shields.io/badge/status-polishing-yellow)   |
| Multi-token Support    | ![Coming Soon](https://img.shields.io/badge/status-coming--soon-yellow)|

---

## 🚀 Run Locally

### 1. Clone the Repository
```bash
git clone [https://github.com/Pushpender-18/Onyx.git](https://github.com/Pushpender-18/Onyx.git)

cd Onyx
```
#### 2. Install Dependencies
```Bash

npm install
```

#### 3. Setup Environment Variables
Create a .env file and add your RPC URL and Private Key:

```Code snippet

MANTLE_RPC_URL=your_rpc_url
PRIVATE_KEY=your_wallet_key
NEXT_PUBLIC_IPFS_KEY=your_ipfs_gateway_key
```
#### 4. Deploy Contracts & Start App
```Bash
// If running on local chain (optional)
pnpm run start:node

pnpm run contract:deploy

pnpm run dev
```

## 👋 Connect with us:
<table align="left"> 
  <tr> <td align="center"> <a href="https://www.google.com/search?q=https://github.com/Pushpender-18"> 
    <img src="https://www.google.com/search?q=https://github.com/Pushpender-18.png" width="80" height="80">


<sub><b>Pushpender Singh</b></sub> </a> </td> <td align="center"> <a href="https://github.com/amitrajeet7635"> <img src="https://github.com/amitrajeet7635.png" width="80" height="80">


<sub><b>Amitrajeet Konch</b></sub> </a> </td> </tr> </table>
