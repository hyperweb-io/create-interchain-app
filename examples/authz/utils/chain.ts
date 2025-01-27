import { assetLists } from '@chain-registry/v2';
import { Asset, AssetList, Chain } from '@chain-registry/v2-types';

export const getChainLogoByChainName = (chainName: string): string => {
  const asset = assetLists.find(({ chainName: n }) => n === chainName)
    ?.assets?.[0];
  return Object.values(asset?.logoURIs || {})?.[0] || '';
};

export const getChainLogoFromChain = (chain: Chain) => {
  return Object.values(chain?.logoURIs || {})?.[0] || '';
};

export const getChainAssets = (chainName: string) => {
  return assetLists.find((chain) => chain.chainName === chainName) as AssetList;
};

export const getTokenByChainName = (chainName: string) => {
  const chainAssets = getChainAssets(chainName);
  return chainAssets.assets[0] as Asset;
};

export const getExponentByChainName = (chainName: string) => {
  return (
    getTokenByChainName(chainName).denomUnits.find(
      (unit) => unit.denom === getTokenByChainName(chainName).display
    )?.exponent || 6
  );
};

export const getExponentByDenom = (denom: string) => {
  const asset = assetLists.find((chain) => chain.assets[0].base === denom)
    ?.assets[0];
  const exponent = asset?.denomUnits.find(
    (unit) => unit.denom === asset.display
  )?.exponent;
  return exponent || 6;
};

export const getSymbolByDenom = (denom: string) => {
  const asset = assetLists.find((chain) => chain.assets[0].base === denom)
    ?.assets[0];
  return asset?.symbol || '';
};
