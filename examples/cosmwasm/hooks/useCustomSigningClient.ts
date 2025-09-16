import { DirectSigner, createCosmosQueryClient } from '@interchainjs/cosmos';
import { useQuery } from '@tanstack/react-query';
import { useChain } from '@interchain-kit/react';

export const useCustomSigningClient = ({
  chainName,
  signerType = 'direct',
}: {
  chainName: string;
  signerType?: 'direct' | 'amino';
}) => {
  const { chain, getRpcEndpoint } = useChain(chainName);

  const chainId = chain.chainId || '';

  return useQuery({
    queryKey: ['useCustomSigningClient', signerType, chainId],
    queryFn: async () => {
      const offlineSignerAmino = (window as any).keplr.getOfflineSignerOnlyAmino(chainId);
      const offlineSignerDirect = (window as any).keplr.getOfflineSigner(chainId);

      // Get RPC endpoint
      const rpcEndpoint = await getRpcEndpoint();
      const rpcUrl = typeof rpcEndpoint === 'string' ? rpcEndpoint : rpcEndpoint!.url;
      
      // Create query client for signer configuration
      const queryClient = await createCosmosQueryClient(rpcUrl);

      const baseSignerConfig = {
        queryClient: queryClient,
        chainId: chainId,
        addressPrefix: chain.bech32Prefix || 'cosmos'
      };

      const client = new DirectSigner(
        signerType === 'amino' ? offlineSignerAmino : offlineSignerDirect,
        baseSignerConfig
      );
      
      return client;
    },
    enabled: !!chainId,
  });
};