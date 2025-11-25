import {
  createConfig,
  cookieStorage,
  createStorage,
  http,
} from "wagmi";
import { defineChain } from 'viem';

export const blockdag = defineChain({
  id: 1043,
  name: 'BlockDAG Testnet',
  network: 'blockdag',
  nativeCurrency: {
    name: 'BlockDAG',
    symbol: 'BDAG',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.primordial.bdagscan.com'],
    },
    public: {
      http: ['https://rpc.primordial.bdagscan.com'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Blockdag Explorer',
      url: 'https://primordial.bdagscan.com',
    },
  },
  testnet: true,
});

export function getConfig() {
  return createConfig({
    chains: [blockdag],
    ssr: true,
    storage: createStorage({
      storage: cookieStorage,
    }),
    transports: {
      [blockdag.id]: http(),
    },
    multiInjectedProviderDiscovery: true,
  });
}