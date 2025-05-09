// TODO fix type issues
// @ts-nocheck

import { useState } from 'react';
import { useChain } from '@interchain-kit/react';
import { Box, Button, Spinner, Text, TokenInput } from '@interchain-ui/react';
import BigNumber from 'bignumber.js';

import { useAuthzTx, useSendData, useToast } from '@/hooks';
import {
  getCoin,
  getExponent,
  getChainLogoByChainName,
  shiftDigits,
} from '@/utils';
import { useAuthzContext } from '@/context';
import { AddressInput } from '@/components';
import { MsgSend } from '@interchainjs/react/cosmos/bank/v1beta1/tx';
import { SendAuthorization } from '@interchainjs/react/cosmos/bank/v1beta1/authz';
import { useExec } from '@interchainjs/react/cosmos/authz/v1beta1/tx.rpc.react';
import { defaultContext } from '@tanstack/react-query';
import { WalletState } from '@interchain-kit/core';

type SendSectionProps = {
  chainName: string;
};

export const SendSection = ({ chainName }: SendSectionProps) => {
  const [recipientAddress, setRecipientAddress] = useState('');
  const [amount, setAmount] = useState<number | undefined>(undefined);
  const [isSending, setIsSending] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const { status } = useChain(chainName);
  const { data, isLoading, refetch } = useSendData(chainName);
  const { createExecMsg } = useAuthzTx(chainName);

  const { mutate: exec } = useExec({
    options: {
      context: defaultContext,
    },
  });

  const { permission } = useAuthzContext();
  const { toast } = useToast();

  const coin = getCoin(chainName);
  const exponent = getExponent(chainName);

  const onSendClick = () => {
    if (!amount || !recipientAddress || !permission) return;

    const { grantee, granter, authorization, expiration } = permission;

    const sendAmount = shiftDigits(amount, exponent);

    if (SendAuthorization.is(authorization)) {
      const limitAmount = authorization?.spendLimit?.[0]?.amount;
      if (limitAmount && new BigNumber(sendAmount).gt(limitAmount)) {
        toast({
          type: 'error',
          title: 'Amount exceeds the spending limit',
        });
        return;
      }
    }

    setIsSending(true);

    const msg = MsgSend.toProtoMsg({
      amount: [
        {
          amount: sendAmount,
          denom: coin.base,
        },
      ],
      fromAddress: granter,
      toAddress: recipientAddress,
    });

    const fee = {
      amount: [
        {
          denom: coin.base,
          amount: '75000',
        },
      ],
      gas: '1000000',
    };

    exec(
      {
        signerAddress: grantee,
        message: createExecMsg({ msgs: [msg], grantee }),
        fee: fee,
        memo: 'executing permission',
      },
      {
        onSuccess: () => {
          refetch();
          setAmount(undefined);
          setRecipientAddress('');
        },
        onError: () => {
          setIsSending(false);
        },
      }
    );
  };

  if (status !== WalletState.Connected) {
    return (
      <Text
        color="$textSecondary"
        fontWeight="$semibold"
        fontSize="$xl"
        textAlign="center"
        attributes={{ mt: '$20', mb: '$22' }}
      >
        Please connect the wallet
      </Text>
    );
  }

  if (isLoading || !data) {
    return (
      <Box mt="$20" mb="$22" display="flex" justifyContent="center">
        <Spinner size="$7xl" />
      </Box>
    );
  }

  return (
    <Box mt="$18" mb="$22" width="$containerSm" mx="auto">
      <Text fontSize="$2xl" fontWeight="$semibold" attributes={{ mb: '$12' }}>
        Send
      </Text>

      <AddressInput
        label="Recipient Address"
        placeholder="Enter recipient address"
        chainName={chainName}
        address={recipientAddress}
        onAddressChange={setRecipientAddress}
        onInvalidAddress={setErrorMsg}
        mb="$12"
      />

      <TokenInput
        title="Amount"
        symbol={coin.symbol}
        amount={amount}
        onAmountChange={setAmount}
        available={Number(data.balance)}
        priceDisplayAmount={data.prices[coin.base]}
        tokenIcon={getChainLogoByChainName(chainName)}
        attributes={{ mb: '$15' }}
        hasProgressBar={false}
        availableAsMax
      />

      <Button
        intent="tertiary"
        disabled={!amount || !recipientAddress || isSending || !!errorMsg}
        onClick={onSendClick}
        fluidWidth
      >
        Send
      </Button>
    </Box>
  );
};
