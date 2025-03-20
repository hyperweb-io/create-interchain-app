import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@chakra-ui/react';
import { WalletManager } from '@interchain-kit/core';
import { keplrWallet } from '@interchain-kit/keplr-extension';
import { chain as cosmoshubChain, assetList as cosmoshubAssetList } from '@chain-registry/v2/mainnet/cosmoshub';
import { RPC_ENDPOINT } from '../utils/constants';

export const useWalletManager = () => {
  const [walletManager, setWalletManager] = useState<WalletManager | null>(null);
  const [address, setAddress] = useState<string>('');
  const toast = useToast();

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
      } catch (error) {
        console.error('Error initializing wallet manager:', error);
        toast({
          title: 'Wallet initialization failed',
          description: (error as Error).message,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
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
    } catch (error) {
      console.error('Error connecting wallet:', error);
      toast({
        title: 'Connection failed',
        description: (error as Error).message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  }, [walletManager, toast]);

  return { walletManager, address, connectWallet };
};