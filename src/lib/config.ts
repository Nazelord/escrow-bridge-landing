import {
  createConfig,
  cookieStorage,
  createStorage,
  http,
} from "wagmi";
import { defineChain } from 'viem';

export const baseSepolia = defineChain({
  id: 84532,
  name: 'Base Sepolia Testnet',
  network: 'base-sepolia',
  nativeCurrency: {
    name: 'Base Sepolia ETH',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://sepolia.base.org/'],
    },
    public: {
      http: ['https://sepolia.base.org/'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Base Sepolia Explorer',
      url: 'https://sepolia-explorer.base.org/',
    },
  },
  testnet: true,
});

// USDC token address for Base Sepolia testnet.
// NOTE: Set NEXT_PUBLIC_USDC_BASE_SEPOLIA in your environment to the USDC contract address
// for the Base Sepolia testnet. Leave empty to disable token balance fetch.
export const USDC_BASE_SEPOLIA = process.env.NEXT_PUBLIC_USDC_BASE_SEPOLIA ?? "";

export function getConfig() {
  return createConfig({
    chains: [baseSepolia],
    ssr: true,
    storage: createStorage({
      storage: cookieStorage,
    }),
    transports: {
      [baseSepolia.id]: http(),
    },
    multiInjectedProviderDiscovery: true,
  });
}


// export const blockdag = defineChain({
//   id: 1043,
//   name: 'BlockDAG Testnet',
//   network: 'blockdag',
//   nativeCurrency: {
//     name: 'BlockDAG',
//     symbol: 'BDAG',
//     decimals: 18,
//   },
//   rpcUrls: {
//     default: {
//       http: ['https://rpc.primordial.bdagscan.com'],
//     },
//     public: {
//       http: ['https://rpc.primordial.bdagscan.com'],
//     },
//   },
//   blockExplorers: {
//     default: {
//       name: 'Blockdag Explorer',
//       url: 'https://primordial.bdagscan.com',
//     },
//   },
//   testnet: true,
// });

// export function getConfig() {
//   return createConfig({
//     chains: [blockdag],
//     ssr: true,
//     storage: createStorage({
//       storage: cookieStorage,
//     }),
//     transports: {
//       [blockdag.id]: http(),
//     },
//     multiInjectedProviderDiscovery: true,
//   });
// }

