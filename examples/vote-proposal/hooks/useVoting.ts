import { useState } from 'react';
import { toast } from '@interchain-ui/react';
import { useChain } from '@interchain-kit/react';
import { StdFee } from '@interchainjs/cosmos-types/types';
import { Proposal } from "interchainjs/cosmos/gov/v1/gov";
import { useTx } from '@/hooks';
import { getCoin } from '@/utils';
import { MessageComposer } from 'interchainjs/cosmos/gov/v1beta1/tx.registry'

export type useVotingOptions = {
  chainName: string;
  proposal: Proposal;
}

export type onVoteOptions = {
  option: number;
  success?: () => void
  error?: () => void
}

export function useVoting({ chainName, proposal }: useVotingOptions) {
  const { tx } = useTx(chainName);
  const { address } = useChain(chainName);
  const [isVoting, setIsVoting] = useState(false);

  const coin = getCoin(chainName);

  async function onVote({ option, success = () => { }, error = () => { } }: onVoteOptions) {
    if (!address || !option) return;

    const msg = MessageComposer.fromPartial.vote({
      option,
      voter: address,
      proposalId: proposal.id,
    });

    const fee: StdFee = {
      amount: [{
        amount: '10000',
        denom: coin.base,
      }],
      gas: '100000',
    };

    try {
      setIsVoting(true);
      const res = await tx([msg], { fee });
      if (res.error) {
        error();
        console.error(res.error);
        toast.error(res.errorMsg);
      } else {
        success();
        toast.success('Vote successful');
      }
    } catch (e) {
      error();
      console.error(e);
      toast.error('Vote failed');
    } finally {
      setIsVoting(false);
    }
  }

  return { isVoting, onVote }
}