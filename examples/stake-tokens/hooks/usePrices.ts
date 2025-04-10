import { assetLists } from '@chain-registry/v2';
import { useQuery } from '@tanstack/react-query';
import { AssetList } from '@chain-registry/v2-types';

type CoinGeckoId = string;
type CoinGeckoUSD = { usd: number };
type CoinGeckoUSDResponse = Record<CoinGeckoId, CoinGeckoUSD>;
export type Prices = Record<CoinGeckoId, CoinGeckoUSD['usd']>;

const handleError = (resp: Response) => {
  if (!resp.ok) throw Error(resp.statusText);
  return resp;
};

const getGeckoIdsFromAssets = (assets: AssetList[]) => {
  return assets
    .map((asset) => asset.assets[0].coingeckoId)
    .filter(Boolean) as string[];
};

const formatPrices = (
  prices: CoinGeckoUSDResponse,
  assets: AssetList[]
): Prices => {
  return Object.entries(prices).reduce((priceHash, cur) => {
    const assetList = assets.find(
      (asset) => asset.assets[0].coingeckoId === cur[0]
    )!;
    const denom = assetList.assets[0].base;
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

export const usePrices = () => {
  const geckoIds = getGeckoIdsFromAssets(assetLists);

  return useQuery({
    queryKey: ['prices'],
    queryFn: () => fetchPrices(geckoIds),
    select: (data) => formatPrices(data, assetLists),
    staleTime: Infinity,
  });
};
