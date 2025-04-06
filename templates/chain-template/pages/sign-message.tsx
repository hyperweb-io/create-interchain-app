import { useState, ChangeEvent } from 'react';
import { Container, Button, Stack, Text, TextField, useColorModeValue } from '@interchain-ui/react';
import { ReactNoSSR } from '@interchain-ui/react-no-ssr';
import { useChain } from '@interchain-kit/react';
import { Layout } from '@/components';
import { useChainStore } from '@/contexts';

export default function SignMessage() {
  const [message, setMessage] = useState('');
  const [signature, setSignature] = useState('');
  const { selectedChain } = useChainStore();
  const { address, wallet } = useChain(selectedChain);

  const handleSign = async () => {
    if (!wallet || !address) {
      alert('Please connect your wallet first');
      return;
    }

    try {
      console.log('wallet', wallet)
      const result = await wallet.signArbitrary(address, message);
      setSignature(result.signature);
    } catch (error) {
      console.error('Error signing message:', error);
      alert('Failed to sign message: ' + (error instanceof Error ? error.message : String(error)));
    }
  };

  const handleMessageChange = (e: ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
  };

  return (
    // @ts-ignore
    <>
      <Container
        maxWidth="600px"
        attributes={{
          paddingX: '$8',
          paddingY: '$14',
        }}
      >
        <Stack direction="vertical" space="$24">
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
            </Stack>
          )}
        </Stack>
      </Container>
    </>
  );
}