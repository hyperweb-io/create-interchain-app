import { assetLists } from '@chain-registry/v2';
import { AssetList, Asset } from '@chain-registry/v2-types';

export const defaultChainName = 'juno';

export const getChainAssets = (chainName: string = defaultChainName) => {
  return assetLists.find((chain) => chain.chainName === chainName) as AssetList;
};

export const getCoin = (chainName: string = defaultChainName) => {
  const chainAssets = getChainAssets(chainName);
  return chainAssets.assets[0] as Asset;
};

export const getExponent = (chainName: string) => {
  return getCoin(chainName).denomUnits.find(
    (unit) => unit.denom === getCoin(chainName).display
  )?.exponent as number;
};