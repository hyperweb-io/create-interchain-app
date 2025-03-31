import { useEffect } from 'react';
import { Button, Container, Stack, Text, Box } from '@interchain-ui/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import WalletDetails from './components/WalletDetails';
import TransferForm from './components/TransferForm';
import { transferFormSchema, type TransferFormData } from './utils/validation';
import { useWalletManager } from './hooks/useWalletManager';
import { useBalance } from './hooks/useBalance';
import { useTransfer } from './hooks/useTransfer';

function App() {
  const { walletManager, address, connectWallet } = useWalletManager();
  const { balance, refetchBalance } = useBalance(address, walletManager);
  const transferMutation = useTransfer(address, walletManager, refetchBalance);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<TransferFormData>({
    resolver: zodResolver(transferFormSchema),
    defaultValues: { amount: '0.000001' },
  });

  const onSubmit = (data: TransferFormData) => {
    if (!balance || Number(data.amount) > balance) {
      return;
    }
    transferMutation.mutate(data);
    reset();
  };

  useEffect(() => {
    if (walletManager) {
      connectWallet();
    }
  }, [walletManager, connectWallet]);

  return (
    <Container
      maxWidth='$containerSm'
      attributes={{ paddingTop: '$8' }}
    >
      <Stack
        direction='vertical'
        space='$6'
        align="stretch"
      >
        <Box>
          <Stack
            direction='vertical'
            space='$6'
            align="stretch"
          >
            <Text as='h1' fontSize='$10xl'>Cosmos Wallet</Text>
            {!address ? (
              <Button onClick={connectWallet}>Connect Keplr</Button>
            ) : (
              <>
                <WalletDetails
                  address={address}
                  balance={balance ?? '0'}
                  onRefresh={refetchBalance}
                />
                <TransferForm
                  register={register}
                  errors={errors}
                  handleSubmit={handleSubmit}
                  onSubmit={onSubmit}
                  isLoading={transferMutation.isMutating}
                />
              </>
            )}
          </Stack>
        </Box>
      </Stack>
    </Container>
  );
}

export default App;