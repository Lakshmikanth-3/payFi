import { ethers } from 'ethers';

export const HASHKEY_TESTNET = {
  chainId: 133,
  name: 'HashKey Chain Testnet',
  rpcUrl: 'https://testnet.hsk.xyz',
  explorer: 'https://testnet-explorer.hsk.xyz',
  nativeCurrency: { name: 'HSK', symbol: 'HSK', decimals: 18 }
};

export const LOCAL_NETWORK = {
  chainId: 31337,
  name: 'Localhost 8545',
  rpcUrl: 'http://127.0.0.1:8545',
  explorer: '',
  nativeCurrency: { name: 'GO', symbol: 'GO', decimals: 18 }
};

export const getNetwork = () => {
    return process.env.NEXT_PUBLIC_ENVIRONMENT === 'testnet' ? HASHKEY_TESTNET : LOCAL_NETWORK;
}

export const getProvider = () =>
  new ethers.JsonRpcProvider(getNetwork().rpcUrl);

export const getTxLink = (hash: string) => {
    const net = getNetwork();
    return net.explorer ? `${net.explorer}/tx/${hash}` : `Transaction Hash: ${hash}`;
}

export const getAddressLink = (address: string) => {
    const net = getNetwork();
    return net.explorer ? `${net.explorer}/address/${address}` : `Address: ${address}`;
}
