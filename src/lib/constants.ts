import ERC20_ABI from './abis/ERC20.json';
import ESCROW_BRIDGE_ABI from './abis/EscrowBridgeETH.json';

export const BRIDGE_ADDRESS = process.env.NEXT_PUBLIC_BRIDGE_ADDRESS || "0x2f8D22821df45cB93A27A4647a577E147Da5A4AD";
export const CHAINSETTLE_API = process.env.NEXT_PUBLIC_CHAINSETTLE_API || "https://api.chainsettle.tech";
export const ESCROW_BRIDGE_API = process.env.NEXT_PUBLIC_ESCROW_BRIDGE_API || "https://app.escrowbridge.xyz";

// BDAG Token Address
export const BDAG_ADDRESS = process.env.NEXT_PUBLIC_BDAG_ADDRESS || "0x364307720164378324965c27fae21242fd5807ee";

export { ERC20_ABI, ESCROW_BRIDGE_ABI };
