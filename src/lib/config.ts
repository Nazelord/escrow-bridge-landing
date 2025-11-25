import {
  createConfig,
  cookieStorage,
  createStorage,
  http,
} from "wagmi";
import { mainnet, sepolia, base, baseSepolia } from "wagmi/chains";

export function getConfig() {
  return createConfig({
    chains: [mainnet, sepolia, base, baseSepolia],
    ssr: true,
    storage: createStorage({
      storage: cookieStorage,
    }),
    transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    [base.id]: http(),
    [baseSepolia.id]: http(),
  },
  multiInjectedProviderDiscovery: true,
});
}