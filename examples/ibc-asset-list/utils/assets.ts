import { Asset as OsmosisAsset } from "@chain-registry/v2-types";
import { assetLists as assets } from "@chain-registry/v2"

let osmosisAssets: OsmosisAsset[] = []
const chainInfo = assets.find(({ chainName }) => chainName === 'osmosis')
if (Array.isArray(chainInfo?.assets)) {
  // @ts-ignore
  osmosisAssets = [...chainInfo?.assets]
}
// assets from chain-registry
let chainInfo2 = assets.find(({ chainName }) => chainName === 'osmosis')
if (Array.isArray(chainInfo2?.assets)) {
  osmosisAssets = [...osmosisAssets, ...chainInfo2.assets]
}

export {
  osmosisAssets
};
