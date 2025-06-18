import { useState, useEffect } from 'react';
import { Container, Button, Stack, Text, useTheme } from '@interchain-ui/react';
import { useChain } from '@interchain-kit/react';
import { useChainStore } from '@/contexts';
import { useToast } from '@/hooks';
import { CosmosWallet, ExtensionWallet, EthereumWallet } from '@interchain-kit/core';

export default function SignMessage() {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [signingIn, setSigningIn] = useState(false);
  const { selectedChain } = useChainStore();
  const { address, wallet, chain } = useChain(selectedChain);
  const { toast } = useToast();
  const { theme } = useTheme();

  useEffect(() => {
    // Load the authentication message when component mounts
    fetchAuthMessage();
  }, []);

  const fetchAuthMessage = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/generate-auth-message');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch authentication message');
      }

      setMessage(data.message);
    } catch (error) {
      console.error('Error fetching auth message:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch authentication message',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignAndLogin = async () => {
    if (!wallet || !address || !chain.chainId) {
      toast({
        title: 'Error',
        description: 'Please connect your wallet first',
        type: 'error'
      });
      return;
    }

    if (!(wallet instanceof ExtensionWallet)) {
      // Handle non-extension wallets if needed
    }

    try {
      setSigningIn(true);
      let result: { signature: string };
      let publicKey: string;
      let messageToSign = message;

      if (chain.chainType === 'eip155') {
        // Handle Ethereum chains
        const ethereumWallet = wallet.getWalletOfType(EthereumWallet);
        if (!ethereumWallet) {
          throw new Error('Ethereum wallet not found');
        }

        // Get MetaMask's current address directly
        const accounts = await ethereumWallet.ethereum.request({ method: 'eth_accounts' });

        // Verify the account we're using for signing matches the frontend
        if (accounts[0].toLowerCase() !== address.toLowerCase()) {
          throw new Error('Address mismatch between frontend and MetaMask');
        }

        // Sign the message using personal_sign (MetaMask accepts string directly)
        const signature = await ethereumWallet.ethereum.request({
          method: 'personal_sign',
          params: [messageToSign, accounts[0]]
        });
        result = { signature };

        // For Ethereum, we'll derive the public key from the signature during verification
        // So we pass the actual MetaMask address as publicKey
        publicKey = accounts[0];
      } else {
        // Handle Cosmos chains
        const cosmosWallet = wallet.getWalletOfType(CosmosWallet);
        if (!cosmosWallet) {
          throw new Error('Cosmos wallet not found');
        }

        // Sign the message
        result = await cosmosWallet.signArbitrary(chain.chainId, address, message);

        // Get the public key
        const account = await wallet?.getAccount(chain.chainId);
        if (!account?.pubkey) {
          throw new Error('Failed to get public key');
        }
        publicKey = Buffer.from(account.pubkey).toString('base64');
      }

      // Submit to API directly
      const response = await fetch('/api/verify-signature', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: messageToSign,
          signature: result.signature,
          publicKey,
          signer: chain.chainType === 'eip155' ? publicKey : address, // Use actual MetaMask address for Ethereum
          chainType: chain.chainType
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      if (!data.success && data.message?.includes('expired')) {
        toast({
          title: 'Authentication expired',
          description: 'Authentication expired, please try again',
          type: 'error'
        });
        handleRefreshMessage();
        return;
      }

      if (data.success) {
        toast({
          title: 'Success',
          description: 'Authentication successful',
          type: 'success'
        });
        // Handle successful login - redirect or update UI state
        // You can add navigation or state management here
      } else {
        throw new Error(data.message || 'Authentication failed');
      }
    } catch (error) {
      console.error('Error signing in:', error);
      toast({
        title: 'Error',
        description: 'Failed to sign in: ' + (error instanceof Error ? error.message : String(error)),
        type: 'error'
      });
    } finally {
      setSigningIn(false);
    }
  };

  const handleRefreshMessage = () => {
    fetchAuthMessage();
  };

  return (
    <>
      <Container
        maxWidth="600px"
        attributes={{
          paddingX: '$8',
          paddingY: '$14',
        }}
      >
        <Stack direction="vertical" space="$12">
          <Text as="h1" fontSize="$xl" fontWeight="$semibold">
            Sign Authentication Message
          </Text>

          <Stack direction="vertical" space="$8">
            <Text as="label" fontSize="$md">
              Authentication Message
            </Text>
            <Container
              attributes={{
                p: '$16',
                backgroundColor: theme === 'light' ? '$gray100' : '$gray900',
                borderRadius: '$md'
              }}
            >
              {loading ? (
                <Text>Loading authentication message...</Text>
              ) : (
                <Text
                  fontSize="$sm"
                  fontFamily="$mono"
                  whiteSpace="pre-wrap"
                  attributes={{ whiteSpace: 'pre-line' }} // This ensures line breaks are preserved
                >
                  {message}
                </Text>
              )}
            </Container>
            <Button
              intent="secondary"
              onClick={handleRefreshMessage}
              size="sm"
              disabled={loading || signingIn}
            >
              Refresh Message
            </Button>
          </Stack>

          <Button
            intent="primary"
            onClick={handleSignAndLogin}
            disabled={!message || !wallet || loading}
            isLoading={signingIn}
          >
            Sign and Login
          </Button>
        </Stack>
      </Container>
    </>
  );
}