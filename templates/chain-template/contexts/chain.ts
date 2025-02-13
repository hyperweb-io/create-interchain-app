import { create } from 'zustand';
import { chains } from '@/config';

interface ChainStore {
  selectedChain: string;
}

export const defaultChain = chains[0].chainName;

export const useChainStore = create<ChainStore>()(() => ({
  selectedChain: defaultChain,
}));

export const chainStore = {
  setSelectedChain: (chainName: string) => {
    useChainStore.setState({ selectedChain: chainName });
  },
};
