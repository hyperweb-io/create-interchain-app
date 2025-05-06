// TODO fix type issues
// @ts-nocheck

import { useState } from 'react';
import {
  Box,
  StakingAssetHeader,
  StakingClaimHeader,
} from '@interchain-ui/react';
import { useChain } from '@interchain-kit/react';
import { useWithdrawDelegatorReward } from '@interchainjs/react/cosmos/distribution/v1beta1/tx.rpc.react';

import { getCoin } from '@/configs';
import { Prices, useTx } from '@/hooks';
import {
  sum,
  calcDollarValue,
  isGreaterThanZero,
  type ParsedRewards as Rewards,
} from '@/utils';
import { defaultContext } from '@tanstack/react-query';
import { MsgWithdrawDelegatorReward } from '@interchainjs/react/cosmos/distribution/v1beta1/tx';

const Overview = ({
  balance,
  rewards,
  staked,
  updateData,
  chainName,
  prices,
}: {
  balance: string;
  rewards: Rewards;
  staked: string;
  updateData: () => void;
  chainName: string;
  prices: Prices;
}) => {
  const [isClaiming, setIsClaiming] = useState(false);
  const { address } = useChain(chainName);

  const totalAmount = sum(balance, staked, rewards?.total ?? 0);
  const coin = getCoin(chainName);
  const withdrawDelegatorReward = useWithdrawDelegatorReward({
    options: {
      context: defaultContext,
    },
  });

  const onClaimRewardClick = async () => {
    setIsClaiming(true);

    if (!address) return;

    const msgs = rewards.byValidators.map(({ validatorAddress }) =>
      MsgWithdrawDelegatorReward.fromPartial({
        delegatorAddress: address,
        validatorAddress,
      })
    );

    const fee = {
      amount: [
        {
          denom: coin.base,
          amount: '75000',
        },
      ],
      gas: '1000000',
    };

    withdrawDelegatorReward(
      {
        address,
        message: msgs,
        fee: fee,
        memo: 'Claiming rewards',
      },
      {
        onSuccess: updateData,
      }
    );

    setIsClaiming(false);
  };

  return (
    <>
      <Box mb={{ mobile: '$8', tablet: '$12' }}>
        <StakingAssetHeader
          imgSrc={
            coin.logoURIs?.png ||
            coin.logoURIs?.svg ||
            coin.logoURIs?.jpeg ||
            ''
          }
          symbol={coin.symbol}
          totalAmount={Number(totalAmount) || 0}
          totalPrice={calcDollarValue(coin.base, totalAmount, prices)}
          available={Number(balance) || 0}
          availablePrice={calcDollarValue(coin.base, balance, prices)}
        />
      </Box>

      {/* <Box mb={{ mobile: '$12', tablet: '$14' }}>
        <StakingClaimHeader
          symbol={coin.symbol}
          rewardsAmount={Number(rewards.total) || 0}
          stakedAmount={Number(staked) || 0}
          onClaim={onClaimRewardClick}
          isLoading={isClaiming}
          isDisabled={!isGreaterThanZero(rewards.total)}
        />
      </Box> */}
    </>
  );
};

export default Overview;
