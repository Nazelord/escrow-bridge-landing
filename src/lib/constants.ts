import ERC20_ABI from './abis/ERC20.json';
import ESCROW_BRIDGE_ABI from './abis/EscrowBridge.json';

export const BRIDGE_ADDRESS = process.env.NEXT_PUBLIC_BRIDGE_ADDRESS || "0x0460f6f3C3448Cda1E9C6d54ebFA99D7C8f0C168";
export const CHAINSETTLE_API = process.env.NEXT_PUBLIC_CHAINSETTLE_API || "https://api.chainsettle.tech/";
export const ESCROW_BRIDGE_API = process.env.NEXT_PUBLIC_ESCROW_BRIDGE_API || "https://app.escrowbridge.xyz/";

export { ERC20_ABI, ESCROW_BRIDGE_ABI };
