import { http, createConfig, createStorage, cookieStorage } from 'wagmi';
import { mainnet } from 'wagmi/chains';
import { injected } from 'wagmi/connectors';

const hashkeyTestnet = {
  id: 133,
  name: 'HashKey Chain Testnet',
  nativeCurrency: { name: 'HSK', symbol: 'HSK', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://testnet.hsk.xyz'] },
  },
  blockExplorers: {
    default: { name: 'Blockscout', url: 'https://testnet-explorer.hsk.xyz' },
  },
  testnet: true,
};

const hashkeyMainnet = {
  id: 177,
  name: 'HashKey Chain Mainnet',
  nativeCurrency: { name: 'HSK', symbol: 'HSK', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://mainnet.hsk.xyz'] },
  },
  blockExplorers: {
    default: { name: 'Blockscout', url: 'https://hashkey.blockscout.com' },
  },
};

export const config = createConfig({
  chains: [hashkeyTestnet, hashkeyMainnet, mainnet],
  connectors: [injected()],
  ssr: true,
  storage: createStorage({
    storage: cookieStorage,
  }),
  transports: {
    [hashkeyTestnet.id]: http(),
    [hashkeyMainnet.id]: http(),
    [mainnet.id]: http(),
  },
})
