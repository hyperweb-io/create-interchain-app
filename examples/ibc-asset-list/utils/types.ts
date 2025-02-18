import { DenomUnit } from '@chain-registry/v2-types';
import { Coin } from 'interchainjs/types';
import { Pool } from '@/types/pool-models';

export type CoinDenom = DenomUnit['denom'];

export type Exponent = DenomUnit['exponent'];

export type CoinSymbol = string;

export interface PriceHash {
  [key: CoinDenom]: number;
}

export type CoinGeckoToken = string;

export interface CoinGeckoUSD {
  usd: number;
}

export type CoinGeckoUSDResponse = Record<CoinGeckoToken, CoinGeckoUSD>;

export interface CoinValue {
  amount: string;
  denom: CoinDenom;
  displayAmount: string;
  value: string;
  symbol: CoinSymbol;
}

export type CoinBalance = Coin & { displayValue: string | number };

export interface PoolAssetPretty {
  symbol: any;
  denom: string;
  amount: string;
  ratio: string;
  info: any;
}

export interface PoolTokenImage {
  token: CoinSymbol;
  images: {
    png: string;
    svg: string;
  };
}

export interface PoolPretty extends Pool {
  nickname: string;
  images: PoolTokenImage[] | null;
  poolAssetsPretty: PoolAssetPretty[];
}

export interface Trade {
  sell: Coin;
  buy: Coin;
}

export interface PrettyPair {
  poolId: string;
  poolAddress: string;
  baseName: string;
  baseSymbol: string;
  baseAddress: string;
  quoteName: string;
  quoteSymbol: string;
  quoteAddress: string;
}
