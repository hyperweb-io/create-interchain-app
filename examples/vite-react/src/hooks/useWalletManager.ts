import { useState, useEffect, useCallback } from 'react';
import { WalletManager } from '@interchain-kit/core';
import { keplrWallet } from '@interchain-kit/keplr-extension';
import { chain as cosmoshubChain, assetList as cosmoshubAssetList } from '@chain-registry/v2/mainnet/cosmoshub';
import { RPC_ENDPOINT } from '../utils/constants';
import { toast } from '@interchain-ui/react';

export const useWalletManager = () => {
  const [walletManager, setWalletManager] = useState<WalletManager | null>(null);
  const [address, setAddress] = useState<string>('');

  useEffect(() => {
    (async () => {
      try {
        const manager = await WalletManager.create(
          [cosmoshubChain],
          [cosmoshubAssetList],
          [keplrWallet],
          {},
          {
            endpoints: {
              cosmoshub: {
                rpc: [RPC_ENDPOINT],
              },
            },
          }
        );
        setWalletManager(manager);
      } catch (error: any) {
        console.error('Error initializing wallet manager:', error);
        toast.error(error.message)
      }
    })();
  }, [toast]);

  const connectWallet = useCallback(async () => {
    try {
      if (!window.keplr) {
        throw new Error('Please install Keplr extension');
      }
      await walletManager?.connect(keplrWallet.info?.name as string, cosmoshubChain.chainName);
      const account = await walletManager?.getAccount(
        keplrWallet.info?.name as string,
        cosmoshubChain.chainName
      );
      setAddress(account?.address as string);
    } catch (error: any) {
      console.error('Error connecting wallet:', error);
      toast.error(error.message)
    }
  }, [walletManager, toast]);

  return { walletManager, address, connectWallet };
};