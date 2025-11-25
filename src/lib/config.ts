import {
  createConfig,
  cookieStorage,
  createStorage,
  http,
} from "wagmi";
import { mainnet, sepolia, base } from "wagmi/chains";

export function getConfig() {
  return createConfig({
    chains: [mainnet, sepolia, base],
    ssr: true,
    storage: createStorage({
      storage: cookieStorage,
    }),
    transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    [base.id]: http(),
  },
  multiInjectedProviderDiscovery: true,
});
}