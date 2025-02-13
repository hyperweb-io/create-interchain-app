import {
  chains as allChains,
  assetLists as allAssetLists,
} from '@chain-registry/v2';

const chainNames = ['osmosistestnet', 'juno', 'stargaze'];

export const chains = chainNames.map(
  (chainName) => allChains.find((chain) => chain.chainName === chainName)!,
);

export const assetLists = chainNames.map(
  (chainName) =>
    allAssetLists.find((assetList) => assetList.chainName === chainName)!,
);
