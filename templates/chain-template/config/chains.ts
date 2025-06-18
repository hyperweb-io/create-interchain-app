import { createAssetListFromEthereumChainInfo, createChainFromEthereumChainInfo } from '@/utils/eth-test-net';
import {
  chains as allChains,
  assetLists as allAssetLists,
} from '@chain-registry/v2'

const chainNames = ['osmosistestnet', 'juno', 'stargaze', 
  // 'ethereum'
];

export const SEPOLIA_TESTNET = {
  chainId: "11155111", // 11155111(0xaa36a7)
  chainName: "Sepolia",
  rpcUrls: ["https://1rpc.io/sepolia"],
  nativeCurrency: {
    name: "Sepolia ETH",
    symbol: "ETH",
    decimals: 18,
  },
  blockExplorerUrls: ["https://sepolia.etherscan.io"],
}
const sepoliaChain = createChainFromEthereumChainInfo(SEPOLIA_TESTNET)
const sepoliaAssetList = createAssetListFromEthereumChainInfo(SEPOLIA_TESTNET)

let chains = chainNames.map(
  (chainName) => allChains.find((chain) => chain.chainName === chainName)!,
)

let assetLists = chainNames.map(
  (chainName) =>
    allAssetLists.find((assetList) => assetList.chainName === chainName)!,
)

chains = [...chains, sepoliaChain]
assetLists = [...assetLists, sepoliaAssetList]

console.log('chains', chains);
console.log('assetLists', assetLists)
export {
  chains,
  assetLists
}