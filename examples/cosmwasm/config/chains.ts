import {
  chains as allChains,
  assetLists as allAssetLists,
} from '@chain-registry/v2';

// Focus on chains that commonly have CosmWasm contracts
const chainNames = ['osmosistestnet', 'juno', 'stargaze'];

export const chains = chainNames.map(
  (chainName) => allChains.find((chain) => chain.chainName === chainName)!,
).filter(Boolean);

export const assetLists = chainNames.map(
  (chainName) =>
    allAssetLists.find((assetList) => assetList.chainName === chainName)!,
).filter(Boolean);