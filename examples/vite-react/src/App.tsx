import { useEffect } from 'react';
import {
  Box,
  Button,
  Container,
  VStack,
  useColorMode,
  IconButton,
  Heading,
  Card,
  CardBody,
} from '@chakra-ui/react';
import { SunIcon, MoonIcon } from '@chakra-ui/icons';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import WalletDetails from './components/WalletDetails';
import TransferForm from './components/TransferForm';
import { transferFormSchema, type TransferFormData } from './utils/validation';
import { useWalletManager } from './hooks/useWalletManager';
import { useBalance } from './hooks/useBalance';
import { useTransfer } from './hooks/useTransfer';

function App() {
  const { colorMode, toggleColorMode } = useColorMode();
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
    <Container maxW="container.sm" py={8}>
      <VStack spacing={6} align="stretch">
        <Box display="flex" justifyContent="flex-end">
          <IconButton
            aria-label="Toggle color mode"
            icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
            onClick={toggleColorMode}
          />
        </Box>
        <Card>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <Heading size="md">Cosmos Wallet</Heading>
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
            </VStack>
          </CardBody>
        </Card>
      </VStack>
    </Container>
  );
}

export default App;