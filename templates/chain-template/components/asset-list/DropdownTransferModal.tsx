import React, { useEffect, useState, useMemo } from 'react';
import {
  BasicModal,
  OverviewTransfer,
  OverviewTransferProps,
} from '@interchain-ui/react';
import { useChainWallet, useWalletManager } from '@interchain-kit/react';
import BigNumber from 'bignumber.js';
import { useTransfer } from '@interchainjs/react/ibc/applications/transfer/v1/tx.rpc.react';
import { MsgTransfer } from '@interchainjs/react/ibc/applications/transfer/v1/tx';
import { defaultContext } from '@tanstack/react-query';
import { StdFee } from '@interchainjs/react/types';

import { truncDecimals } from '@/utils';
import { keplrWalletName } from '@/config';
import {
  useDisclosure,
  useChainUtils,
  useBalance,
  useToastHandlers,
  useSigningClient,
} from '@/hooks';

import {
  PrettyAsset,
  PriceHash,
  TransferInfo,
  Transfer,
  Unpacked,
} from './types';

const ZERO_AMOUNT = '0';

interface OverviewTransferWrapperProps {
  prices: PriceHash;
  assets: PrettyAsset[];
  modalControl: ReturnType<typeof useDisclosure>;
  updateData: () => void;
  transferInfoState: {
    transferInfo: TransferInfo;
    setTransferInfo: React.Dispatch<
      React.SetStateAction<TransferInfo | undefined>
    >;
  };
  selectedChainName: string;
}

const OverviewTransferWrapper = (
  props: OverviewTransferWrapperProps & {
    inputValue: string;
    setInputValue: React.Dispatch<React.SetStateAction<string>>;
  }
) => {
  const {
    assets,
    prices,
    modalControl,
    transferInfoState,
    updateData,
    selectedChainName,
    inputValue,
    setInputValue,
  } = props;

  const {
    convRawToDispAmount,
    symbolToDenom,
    getExponentByDenom,
    getIbcInfo,
    getChainName,
    getNativeDenom,
  } = useChainUtils(selectedChainName);

  const { transferInfo, setTransferInfo } = transferInfoState;

  const {
    type: transferType,
    token: transferToken,
    destChainName,
    sourceChainName,
  } = transferInfo;

  const isDeposit = transferType === 'Deposit';
  const { balance, isLoading: isLoadingBalance } = useBalance(
    sourceChainName,
    isDeposit
  );

  const { address: sourceAddress, connect: connectSourceChain } =
    useChainWallet(sourceChainName, keplrWalletName);

  const { address: destAddress, connect: connectDestChain } = useChainWallet(
    destChainName,
    keplrWalletName
  );

  const { getChainLogoUrl } = useWalletManager();

  const toastHandlers = useToastHandlers();
  const { data: signingClient } = useSigningClient(sourceChainName);
  const { mutate: transfer, isLoading } = useTransfer({
    clientResolver: signingClient,
    options: {
      context: defaultContext,
      ...toastHandlers,
    },
  });

  const availableAmount = useMemo((): number => {
    if (!isDeposit) {
      return transferToken.priceDisplayAmount ?? 0;
    }

    if (isLoadingBalance) {
      return 0;
    }

    return new BigNumber(
      convRawToDispAmount(transferToken.symbol, balance?.amount || ZERO_AMOUNT)
    ).toNumber();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDeposit, isLoadingBalance, transferToken]);

  const dollarValue = new BigNumber(inputValue)
    .multipliedBy(prices[symbolToDenom(transferToken.symbol)])
    .decimalPlaces(2)
    .toString();

  useEffect(() => {
    if (!modalControl.isOpen) return;
    if (!sourceAddress) connectSourceChain();
    if (!destAddress) connectDestChain();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [destAddress, sourceAddress, modalControl]);

  const closeModal = () => {
    modalControl.onClose();
    setInputValue('');
  };

  const handleTransferSubmit = async () => {
    if (!sourceAddress || !destAddress) return;

    const transferAmount = new BigNumber(inputValue)
      .shiftedBy(getExponentByDenom(symbolToDenom(transferToken.symbol)))
      .toString();

    const { sourcePort, sourceChannel } = getIbcInfo(
      sourceChainName,
      destChainName
    );

    const fee: StdFee = {
      amount: [{ denom: transferToken.denom ?? '', amount: '0' }],
      gas: '250000',
    };

    const token = {
      denom: transferToken.denom ?? '',
      amount: transferAmount,
    };

    const stamp = Date.now();
    const timeoutInNanos = (stamp + 1.2e6) * 1e6;

    const msg = MsgTransfer.fromPartial({
      sourcePort,
      sourceChannel,
      sender: sourceAddress,
      receiver: destAddress,
      token,
      timeoutHeight: undefined,
      timeoutTimestamp: BigInt(timeoutInNanos),
    });

    transfer(
      {
        signerAddress: sourceAddress,
        message: msg,
        fee,
        memo: 'Transfer',
      },
      {
        onSuccess: () => {
          updateData();
          closeModal();
        },
      }
    );
  };

  const assetOptions: OverviewTransferProps['dropdownList'] = useMemo(() => {
    return (
      assets
        .filter((asset) => {
          if (isDeposit) {
            return true;
          }
          return new BigNumber(asset.amount).gt(0);
        })
        // .filter((asset) => {
        //   return asset.symbol !== transferToken.symbol;
        // })
        .map((asset) => ({
          available: new BigNumber(asset.displayAmount).toNumber(),
          symbol: asset.symbol,
          name: asset.prettyChainName,
          denom: asset.denom,
          imgSrc: asset.logoUrl ?? '',
          priceDisplayAmount: new BigNumber(
            truncDecimals(asset.dollarValue, 2)
          ).toNumber(),
        }))
    );
  }, [assets, isDeposit, transferToken]);
  console.log('assetOptions', assetOptions);

  const handleOnChange = (
    assetOption: Unpacked<OverviewTransferProps['dropdownList']>,
    value: number
  ) => {
    setInputValue(`${value}`);

    setTransferInfo((prev) => {
      if (!prev) return;

      if (transferType === Transfer.Withdraw) {
        const destChainName = getChainName(assetOption.denom ?? '');
        return { ...prev, destChainName, token: assetOption };
      }

      const sourceChainName = getChainName(assetOption.denom ?? '');
      const sourceChainAssetDenom = getNativeDenom(sourceChainName);
      return {
        ...prev,
        sourceChainName,
        token: {
          ...assetOption,
          available: availableAmount,
          displayAmount: ZERO_AMOUNT,
          dollarValue: ZERO_AMOUNT,
          amount: ZERO_AMOUNT,
          denom: sourceChainAssetDenom,
        },
      };
    });
  };

  return (
    <OverviewTransfer
      selectedItem={transferToken}
      isSubmitDisabled={
        isLoading ||
        !inputValue ||
        new BigNumber(inputValue).isEqualTo(0) ||
        isNaN(Number(inputValue))
      }
      fromChainLogoUrl={
        getChainLogoUrl(transferInfo?.sourceChainName ?? '') ?? ''
      }
      toChainLogoUrl={getChainLogoUrl(transferInfo?.destChainName ?? '') ?? ''}
      dropdownList={assetOptions}
      onTransfer={() => {
        handleTransferSubmit();
      }}
      onCancel={() => {
        closeModal();
      }}
      onChange={handleOnChange}
      timeEstimateLabel="≈ 20 seconds"
    />
  );
};

export const DropdownTransferModal = (props: OverviewTransferWrapperProps) => {
  const { modalControl, transferInfoState } = props;

  const [inputValue, setInputValue] = useState('');

  const closeModal = () => {
    modalControl.onClose();
    setInputValue('');
  };

  return (
    <BasicModal
      isOpen={modalControl.isOpen}
      title={transferInfoState.transferInfo.type}
      onClose={() => closeModal()}
    >
      {transferInfoState ? (
        <OverviewTransferWrapper
          {...props}
          modalControl={{
            ...props.modalControl,
            onClose: closeModal,
          }}
          inputValue={inputValue}
          setInputValue={setInputValue}
        />
      ) : null}
    </BasicModal>
  );
};
