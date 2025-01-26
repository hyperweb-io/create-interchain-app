import { Asset } from '@chain-registry/v2-types';
import { useQuery } from '@tanstack/react-query';
import { useChainUtils } from '../useChainUtils';
import { handleError } from './useTopTokens';

type CoinGeckoId = string;
type CoinGeckoUSD = { usd: number };
type CoinGeckoUSDResponse = Record<CoinGeckoId, CoinGeckoUSD>;

const getAssetsWithGeckoIds = (assets: Asset[]) => {
  return assets // .filter((asset) => !!asset?.coingeckoId);
};

const getGeckoIds = (assets: Asset[]) => {
  return assets.map((asset) => asset.coingeckoId ?? asset.name.toLowerCase()) as string[];
};

const formatPrices = (
  prices: CoinGeckoUSDResponse,
  assets: Asset[]
): Record<string, number> => {
  return Object.entries(prices).reduce((priceHash, cur) => {
    const denom = assets.find((asset) => asset.coingeckoId === cur[0] || asset.name.toLowerCase() === cur[0])!.base;
    return { ...priceHash, [denom]: cur[1].usd };
  }, {});
};

const fetchPrices = async (
  geckoIds: string[]
): Promise<CoinGeckoUSDResponse> => {
  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${geckoIds.join()}&vs_currencies=usd`;

  return fetch(url)
    .then(handleError)
    .then((res) => res.json());
};

export const usePrices = (chainName: string) => {
  const { allAssets } = useChainUtils(chainName);
  const assetsWithGeckoIds = getAssetsWithGeckoIds(allAssets);
  const geckoIds = getGeckoIds(assetsWithGeckoIds);

  return useQuery({
    queryKey: ['prices', chainName],
    queryFn: () => fetchPrices(geckoIds),
    select: (data) => formatPrices(data, assetsWithGeckoIds),
    staleTime: Infinity,
  });
};
