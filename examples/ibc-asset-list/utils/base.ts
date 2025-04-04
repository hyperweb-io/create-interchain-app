import { osmosisAssets } from './assets';
import {
  CoinGeckoToken,
  CoinDenom,
  Exponent,
  CoinSymbol,
  PriceHash,
  CoinGeckoUSDResponse,
} from './types';
import { Asset as OsmosisAsset } from '@chain-registry/v2-types';
import BigNumber from 'bignumber.js';

export const getOsmoAssetByDenom = (denom: CoinDenom): OsmosisAsset => {
  return osmosisAssets.find((asset) => asset.base === denom) as OsmosisAsset;
};

export const getDenomForCoinGeckoId = (
  coinGeckoId: CoinGeckoToken
): CoinDenom => {
  // @ts-ignore
  return osmosisAssets.find((asset) => asset.coingecko_id === coinGeckoId).base;
};

export const osmoDenomToSymbol = (denom: CoinDenom): CoinSymbol => {
  const asset = getOsmoAssetByDenom(denom);
  const symbol = asset?.symbol;
  if (!symbol) {
    return denom;
  }
  return symbol;
};

export const symbolToOsmoDenom = (token: CoinSymbol): CoinDenom => {
  const asset = osmosisAssets.find(({ symbol }) => symbol === token);
  const base = asset?.base;
  if (!base) {
    console.log(`cannot find base for token ${token}`);
    // @ts-ignore
    return null;
  }
  return base;
};

export const getExponentByDenom = (denom: CoinDenom): Exponent => {
  const asset = getOsmoAssetByDenom(denom);
  const unit = asset.denomUnits.find(({ denom }) => denom === asset.display);
  // @ts-ignore
  return unit.exponent;
};

export const convertGeckoPricesToDenomPriceHash = (
  prices: CoinGeckoUSDResponse
): PriceHash => {
  return Object.keys(prices).reduce((res, geckoId) => {
    const denom = getDenomForCoinGeckoId(geckoId);
    // @ts-ignore
    res[denom] = prices[geckoId].usd;
    return res;
  }, {});
};

export const noDecimals = (num: number | string) => {
  return new BigNumber(num).decimalPlaces(0, BigNumber.ROUND_DOWN).toString();
};

export const baseUnitsToDollarValue = (
  prices: PriceHash,
  symbol: string,
  amount: string | number
) => {
  const denom = symbolToOsmoDenom(symbol);
  return new BigNumber(amount)
    .shiftedBy(-getExponentByDenom(denom))
    .multipliedBy(prices[denom])
    .toString();
};

export const dollarValueToDenomUnits = (
  prices: PriceHash,
  symbol: string,
  value: string | number
) => {
  const denom = symbolToOsmoDenom(symbol);
  return new BigNumber(value)
    .dividedBy(prices[denom])
    .shiftedBy(getExponentByDenom(denom))
    .toString();
};

export const baseUnitsToDisplayUnits = (
  symbol: string,
  amount: string | number
) => {
  const denom = symbolToOsmoDenom(symbol);
  return new BigNumber(amount).shiftedBy(-getExponentByDenom(denom)).toString();
};
