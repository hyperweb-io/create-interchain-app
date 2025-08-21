import BigNumber from 'bignumber.js';
import { Ref, computed } from 'vue';
import { assetLists } from '@chain-registry/v2';
import { useGetBalance } from '@interchainjs/vue/cosmos/bank/v1beta1/query.rpc.vue';
import { defaultRpcEndpoint } from '../../config/asset-list/defaults';
import { useChain } from '@interchain-kit/vue';

export const useBalanceVue = (chainName: Ref<string>) => {
  const chainInfo = useChain(chainName);

  const { address } = chainInfo;

  const defaultAssetList = assetLists.find(
    (assetList) => assetList.chainName === chainName.value
  );

  const coin = defaultAssetList?.assets[0];

  const denom = coin!.base!;

  const COIN_DISPLAY_EXPONENT = coin!.denomUnits.find(
    (unit) => unit.denom === coin!.display
  )?.exponent as number;

  const request = computed(() => ({
    address: address.value,
    denom,
  }));

  const {
    data: balance,
    isSuccess: isBalanceLoaded,
    isLoading: isFetchingBalance,
    refetch: refetchBalance,
  } = useGetBalance({
    request,
    options: {
      enabled: !!address.value,
      //@ts-ignore
      select: ({ balance }) =>
        new BigNumber(balance?.amount ?? 0).multipliedBy(
          10 ** -COIN_DISPLAY_EXPONENT
        ),
    },
    clientResolver: defaultRpcEndpoint,
  });

  return {
    balance,
    isBalanceLoaded,
    isFetchingBalance,
    refetchBalance,
    denom,
  };
};

export default useBalanceVue;
