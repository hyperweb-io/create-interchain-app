import { useChain } from '@interchain-kit/vue';
import { toConverters, toEncoders } from '@interchainjs/cosmos/utils';
import { InjSigningClient } from '@interchainjs/injective/signing-client';
import { MsgSend } from '@interchainjs/vue/cosmos/bank/v1beta1/tx';
import { Ref, computed, ref, watch } from 'vue';

export const useInjectiveClient = (chainName: Ref<string>) => {
  const { rpcEndpoint, chain, wallet } = useChain(chainName);
  const injectiveClient = ref();
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
    signer.signMode = 'direct';
    let res = await InjSigningClient.connectWithSigner(rpcEndpoint, signer);

    injectiveClient.value = res;
    injectiveClient.value?.addEncoders(toEncoders(MsgSend));
    injectiveClient.value?.addConverters(toConverters(MsgSend));
  };
  watch([rpcEndpoint, signer], ([rpc, sn]) => {
    _fetchClient(rpc as string, sn);
  });
  _fetchClient(rpcEndpoint.value as string, signer.value);
  return injectiveClient;
};
