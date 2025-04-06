import { useState, ChangeEvent } from 'react';
import { Container, Button, Stack, Text, TextField } from '@interchain-ui/react';
import { useChain } from '@interchain-kit/react';
import { useChainStore } from '@/contexts';
import { useToast } from '@/hooks';

export default function SignMessage() {
  const [message, setMessage] = useState('');
  const [signature, setSignature] = useState('');
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [verifying, setVerifying] = useState(false);
  const { selectedChain } = useChainStore();
  const { address, wallet, chain } = useChain(selectedChain);
  const { toast } = useToast();

  const handleSign = async () => {
    if (!wallet || !address || !chain.chainId) {
      toast({
        title: 'Error',
        description: 'Please connect your wallet first',
        type: 'error'
      });
      return;
    }

    try {
      setSignature('');
      setIsValid(null);
      const result = await wallet.signArbitrary(chain.chainId, address, message);
      setSignature(result.signature);
    } catch (error) {
      console.error('Error signing message:', error);
      toast({
        title: 'Error',
        description: 'Failed to sign message: ' + (error instanceof Error ? error.message : String(error)),
        type: 'error'
      });
    }
  };

  const handleVerify = async () => {
    if (!signature || !address || !chain.chainId) return;

    try {
      setVerifying(true);
      const account = await wallet?.getAccount(chain.chainId);
      if (!account?.pubkey) {
        throw new Error('Failed to get public key');
      }

      const response = await fetch('/api/verify-signature', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          signature,
          publicKey: Buffer.from(account.pubkey).toString('base64'),
          signer: address
        }),
      });

      const data = await response.json();
      setIsValid(data.success);
    } catch (error) {
      console.error('Error verifying signature:', error);
      toast({
        title: 'Error',
        description: 'Failed to verify signature',
        type: 'error'
      });
    } finally {
      setVerifying(false);
    }
  };

  const handleMessageChange = (e: ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
    setSignature('');
    setIsValid(null);
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
            Sign Arbitrary Message
          </Text>

          <Stack direction="vertical" space="$8">
            <Text as="label" fontSize="$md">
              Message to Sign
            </Text>
            <TextField
              id="message"
              placeholder="Enter your message here"
              value={message}
              onChange={handleMessageChange}
            />
          </Stack>

          <Button
            intent="tertiary"
            onClick={handleSign}
            disabled={!message || !wallet}
          >
            Sign Message
          </Button>

          {signature && (
            <Stack direction="vertical" space="$8">
              <Text fontWeight="$semibold">Signature:</Text>
              <Container
                attributes={{
                  p: '$16',
                  backgroundColor: '$gray100',
                  borderRadius: '$md'
                }}
              >
                <Text fontSize="$sm" fontFamily="$mono">
                  {signature}
                </Text>
              </Container>

              <Button
                intent="primary"
                onClick={handleVerify}
                disabled={verifying}
                isLoading={verifying}
              >
                Verify Signature
              </Button>

              {isValid !== null && (
                <Text
                  fontSize="$md"
                  color={isValid ? '$green500' : '$red500'}
                  fontWeight="$medium"
                >
                  Signature is {isValid ? 'valid' : 'invalid'}
                </Text>
              )}
            </Stack>
          )}
        </Stack>
      </Container>
    </>
  );
}