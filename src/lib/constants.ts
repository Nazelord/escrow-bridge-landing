import ERC20_ABI from './abis/ERC20.json';
import ESCROW_BRIDGE_ABI from './abis/EscrowBridge.json'; // ERC20 version for USDC
// import ESCROW_BRIDGE_ETH_ABI from './abis/EscrowBridgeETH.json'; // Native ETH/BDAG version

export const BRIDGE_ADDRESS = process.env.NEXT_PUBLIC_BRIDGE_ADDRESS || "0x30C6E98101C90eD65F4fA5f15188694aCf1D712B";
export const CHAINSETTLE_API = process.env.NEXT_PUBLIC_CHAINSETTLE_API || "https://api.chainsettle.tech";
export const ESCROW_BRIDGE_API = process.env.NEXT_PUBLIC_ESCROW_BRIDGE_API || "https://app.escrowbridge.xyz";

// USDC Token Address for Base Sepolia
// Set NEXT_PUBLIC_USDC_ADDRESS in your .env.local file
export const USDC_ADDRESS = process.env.NEXT_PUBLIC_USDC_ADDRESS || "0x036CbD53842c5426634e7929541eC2318f3dCF7e"; // Base Sepolia USDC
export const USDC_DECIMALS = 6; // USDC uses 6 decimals

// ===== COMMENTED OUT: BDAG/Blockdag setup (kept for possible future dual-chain setup) =====
// export const BDAG_ADDRESS = process.env.NEXT_PUBLIC_BDAG_ADDRESS || "0x364307720164378324965c27fae21242fd5807ee";
// =========================================================================================

export { ERC20_ABI, ESCROW_BRIDGE_ABI };
