import { Asset, AssetList } from '@chain-registry/v2-types';
import { assetLists as ibcAssetLists } from '@chain-registry/v2';
import { assetLists as chainAssets } from '@chain-registry/v2';
import { Ref } from 'vue'


export const useAssets = (chainName: Ref<string>) => {
  const filterAssets = (assetList: AssetList[]): Asset[] => {
    return (
      assetList
        .find(({ chainName: name }) => name === chainName.value)
        ?.assets?.filter(({ typeAsset: ta }) => ta !== 'ics20') || []
    );
  };

  const nativeAssets = filterAssets(chainAssets);
  const ibcAssets = filterAssets(ibcAssetLists);

  const allAssets = [...nativeAssets, ...ibcAssets];
  return {
    allAssets,
    nativeAssets,
    ibcAssets
  }
}