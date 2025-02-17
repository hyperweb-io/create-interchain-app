import { assetLists as assets } from '@chain-registry/v2';
import { AssetList, Asset } from '@chain-registry/v2-types';

export const defaultChainName = 'osmosis';
export const KeplrWalletName = 'keplr-extension';

export const chainassets: AssetList = assets.find(
  (chain) => chain.chainName === defaultChainName
) as AssetList;

export const coin: Asset = chainassets.assets.find(
  (asset) => asset.base === 'uosmo'
) as Asset;