import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Input,
  Text,
  VStack,
  useToast,
  IconButton,
  useColorMode,
  Link,
  Heading,
  Card,
  CardBody,
  HStack,
} from '@chakra-ui/react';
import { SunIcon, MoonIcon, RepeatIcon } from '@chakra-ui/icons';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useMutation } from '@tanstack/react-query';
import { transferFormSchema, type TransferFormData } from './utils/validation';
import {
  REST_ENDPOINT,
  DENOM,
  DENOM_DISPLAY,
  DECIMAL,
} from './utils/constants';
import { chain as cosmoshubChain, assetList as cosmoshubAssetList } from '@chain-registry/v2/mainnet/cosmoshub'
import { WalletManager } from '@interchain-kit/core'
import { keplrWallet } from '@interchain-kit/keplr-extension'
import { createSend } from "interchainjs/cosmos/bank/v1beta1/tx.rpc.func";

function App() {
  const [address, setAddress] = useState('');
  const [walletManager, setWalletManager] = useState<WalletManager | null>(null)
  const { colorMode, toggleColorMode } = useColorMode();
  const toast = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<TransferFormData>({
    resolver: zodResolver(transferFormSchema),
    defaultValues: {
      amount: "0.000001",
    },
  });

  useEffect(() => {
    (async () => {
      const walletManager = await WalletManager.create(
        [cosmoshubChain],
        [cosmoshubAssetList],
        [keplrWallet]
      )
      setWalletManager(walletManager)
    })()
  }, [])

  const { data: balance, refetch: refetchBalance } = useQuery({
    queryKey: ['balance', address],
    queryFn: async () => {
      if (!address) return null;
      try {
        const response = await fetch(
          `${REST_ENDPOINT}/cosmos/bank/v1beta1/balances/${address}`
        );
        if (!response.ok) {
          throw new Error('Failed to fetch balance');
        }
        const data = await response.json();
        // Log the response to see what we're getting
        console.log('Balance response:', data);
        if (!data.balances) {
          return 0;
        }
        const atomBalance = data.balances.find((b: any) => b.denom === DENOM);
        if (!atomBalance) {
          return 0;
        }
        return Number(atomBalance.amount) / Math.pow(10, DECIMAL);
      } catch (error) {
        console.error('Error fetching balance:', error);
        toast({
          title: 'Error fetching balance',
          description: (error as Error).message,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        return null;
      }
    },
    enabled: !!address && !!walletManager,
    staleTime: 10000, // Consider data fresh for 10 seconds
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const transferMutation = useMutation({
    mutationFn: async (data: TransferFormData) => {
      if (!window.keplr || !address) throw new Error('Keplr not connected');
      const amount = Math.floor(Number(data.amount) * Math.pow(10, DECIMAL));
      const fee = {
        amount: [{ denom: DENOM, amount: "5000" }], // adjust fee amount as needed
        gas: "200000" // adjust gas limit as needed
      };

      const message = {
        fromAddress: address,
        toAddress: data.recipient,
        amount: [
          {
            denom: DENOM,
            amount: amount.toString()
          },
        ],
      }
      const signingClient = await walletManager?.getSigningClient(keplrWallet.info?.name as string, cosmoshubChain.chainName)
      const txSend = createSend(signingClient);
      const res = await txSend(
        address,
        message,
        fee,
        ''
      )
      await new Promise(resolve => setTimeout(resolve, 6000));
      return (res as any).hash
    },
    onSuccess: (txHash) => {
      toast({
        title: 'Transfer successful',
        description: (
          <Link
            href={`https://www.mintscan.io/cosmos/txs/${txHash}`}
            isExternal
            color="white"
          >
            <u>View transaction details</u>
          </Link>
        ),
        status: 'success',
        duration: null,
        isClosable: true,
      });
      reset();
      refetchBalance();
    },
    onError: (error: Error) => {
      console.error('Error transferring funds:', error);
      toast({
        title: 'Transfer failed',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    },
  });

  const connectWallet = async () => {
    try {
      if (!window.keplr) {
        throw new Error('Please install Keplr extension');
      }
      await walletManager?.connect(keplrWallet.info?.name as string, cosmoshubChain.chainName)
      const account = await walletManager?.getAccount(keplrWallet.info?.name as string, cosmoshubChain.chainName)
      setAddress(account?.address as string)
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
  };

  const onSubmit = (data: TransferFormData) => {
    if (!balance || Number(data.amount) > balance) {
      toast({
        title: 'Insufficient balance',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    transferMutation.mutate(data);
  };

  useEffect(() => {
    if (!walletManager) return
    connectWallet();
  }, [
    walletManager
  ]);

  const handleRefreshBalance = () => {
    refetchBalance();
    toast({
      title: 'Refreshing balance...',
      status: 'info',
      duration: 2000,
      isClosable: true,
    });
  };

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
                  <Text>Address: {address}</Text>
                  <HStack>
                    <Text>
                      Balance: {balance ?? '0'} {DENOM_DISPLAY}
                    </Text>
                    <IconButton
                      aria-label="Refresh balance"
                      icon={<RepeatIcon />}
                      size="sm"
                      onClick={handleRefreshBalance}
                    />
                  </HStack>

                  <form onSubmit={handleSubmit(onSubmit)}>
                    <VStack spacing={4}>
                      <FormControl isInvalid={!!errors.recipient}>
                        <FormLabel>Recipient Address</FormLabel>
                        <Input {...register('recipient')} />
                        {errors.recipient && (
                          <Text color="red.500">{errors.recipient.message}</Text>
                        )}
                      </FormControl>

                      <FormControl isInvalid={!!errors.amount}>
                        <FormLabel>Amount ({DENOM_DISPLAY})</FormLabel>
                        <Input {...register('amount')} type="number" step="0.000001" />
                        {errors.amount && (
                          <Text color="red.500">{errors.amount.message}</Text>
                        )}
                      </FormControl>

                      <Button
                        type="submit"
                        colorScheme="blue"
                        isLoading={transferMutation.isPending}
                        width="100%"
                      >
                        Transfer
                      </Button>
                    </VStack>
                  </form>
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