import BigNumber from "bignumber.js";
import { Ref, computed } from "vue";
import { assetLists } from "@chain-registry/v2";
import { useGetBalance } from '@interchainjs/vue/cosmos/bank/v1beta1/query.rpc.vue';

const defaultChainName = 'osmosistestnet' // 'cosmoshub'\
const defaultAssetList = assetLists.find((assetList) => assetList.chainName === defaultChainName)
const defaultRpcEndpoint = 'https://rpc.testnet.osmosis.zone' // 'https://cosmos-rpc.publicnode.com'

export const useBalanceVue = (address: Ref) => {
  const coin = defaultAssetList?.assets[0];

  const denom = coin!.base!

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
    refetch: refetchBalance
  } = useGetBalance({
    request,
    options: {
      enabled: !!address,
      //@ts-ignore
      select: ({ balance }) =>
        new BigNumber(balance?.amount ?? 0).multipliedBy(
          10 ** -COIN_DISPLAY_EXPONENT
        ),
    },
    clientResolver: defaultRpcEndpoint,
  })

  return {
    balance,
    isBalanceLoaded,
    isFetchingBalance,
    refetchBalance,
    denom,
  };
};

export default useBalanceVue;