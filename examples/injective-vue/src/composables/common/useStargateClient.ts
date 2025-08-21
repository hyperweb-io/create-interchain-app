import { Ref, computed, ref, watch } from 'vue';
import { useChain } from '@interchain-kit/vue';
import { SigningClient as SigningStargateClient } from '@interchainjs/cosmos/signing-client';

export const useStargateClient = (chainName: Ref<string>) => {
  const { rpcEndpoint, chain, wallet } = useChain(chainName);
  const stargazeClient = ref();
  const signer = computed(() => {
    if (!chain.value.chainId) {
      return;
    }
    if (!wallet.value) {
      return;
    }
    return wallet.value.getOfflineSigner(chain.value.chainId, 'direct'); // cosmoshub-4
  });
  const _fetchClient = async (rpcEndpoint: string, signer: any) => {
    if (!rpcEndpoint || !signer) {
      return;
    }
    let res = await SigningStargateClient.connectWithSigner(
      rpcEndpoint,
      signer
    );
    stargazeClient.value = res;
  };
  watch([rpcEndpoint, signer], ([rpc, sn]) => {
    _fetchClient(rpc as string, sn);
  });
  _fetchClient(rpcEndpoint.value as string, signer.value);
  return stargazeClient;
};
