import { Box, Button, Link, Text } from '@interchain-ui/react';
import { MsgTransfer } from 'interchainjs/ibc/applications/transfer/v1/tx';
import { useChain } from '@interchain-kit/react';
import { toEncoders, toConverters } from '@interchainjs/cosmos/utils'
import { SigningClient } from '@interchainjs/cosmos/signing-client'
import { DirectGenericOfflineSigner, AminoGenericOfflineSigner } from '@interchainjs/cosmos/types/wallet';
import { useState } from 'react';

export default function IbcTest() {
  const [hash, setHash] = useState<string>();
  const [error, setError] = useState<object>();
  const [loading, setLoading] = useState<boolean>(false);

  const {
    address,
    getSigningClient
  } = useChain('cosmoshub');

  const {
    address: addressReceiver,
  } = useChain('osmosis');

  const send = async (params: { signerType: 'direct' | 'amino' }) => {
    setHash(undefined)
    setError(undefined)
    const { signerType } = params;
    const signerAmino = new AminoGenericOfflineSigner((window as any).keplr.getOfflineSignerOnlyAmino("cosmoshub-4"))
    const signerDirect = new DirectGenericOfflineSigner((window as any).keplr.getOfflineSigner("cosmoshub-4"))
    setLoading(true)
    const client = await SigningClient.connectWithSigner(
      'https://cosmos-rpc.publicnode.com',
      signerType === 'amino' ? signerAmino : signerDirect,
      {
        broadcast: {
          checkTx: true,
          deliverTx: false,
          // useLegacyBroadcastTxCommit: true,
        },
      }
    )

    const stamp = Date.now();
    const timeoutInNanos = (stamp + 1.2e6) * 1e6;
    const msg = {
      typeUrl: MsgTransfer.typeUrl,
      value: MsgTransfer.fromPartial({
        sourcePort: 'transfer',
        sourceChannel: 'channel-141',
        token: { denom: 'uatom', amount: '1' },
        sender: address,
        receiver: addressReceiver,
        timeoutTimestamp: BigInt(timeoutInNanos),
        memo: '',
        forwarding: undefined,
      }),
    }
    console.log('msg', msg)

    const fee = {
      amount: [
        {
          denom: 'uatom',
          amount: '10000'
        }
      ],
      gas: '200000'
    }

    client.addEncoders(toEncoders(MsgTransfer))
    client.addConverters(toConverters(MsgTransfer))
    console.log('client', client)
    client.signAndBroadcast(
      address,
      [msg],
      fee,
      ''
    ).then((res: any) => {
      console.log('res', res)
      if (res.code === 0) {
        setHash(res.hash)
      } else {
        setError(res)
      }
    }).catch((err) => {
      console.log('err', err)
    }).finally(() => {
      setLoading(false)
    })
  }
  return (
    <Box display='flex' flexDirection='column' alignItems='center' justifyContent='center' minHeight='100vh'>
      <Text>IBC 0.000001 ATOM from cosmoshub to osmosis</Text>
      <Button onClick={() => send({ signerType: 'direct' })} attributes={{ marginY: '$10' }}
        disabled={loading}
      >Direct Signer</Button>
      <Button onClick={() => send({ signerType: 'amino' })}
        disabled={loading}
      >Amino Signer</Button>
      {hash && <Box marginY='$10' maxWidth='62vw' wordBreak='break-all' overflowWrap='break-word'>
        <Link href={`https://www.mintscan.io/cosmos/tx/${hash}`} target='_blank'>
          https://www.mintscan.io/cosmos/tx/${hash}
        </Link>
      </Box>}
      {error && <Box marginY='$10' maxWidth='62vw' wordBreak='break-all' overflowWrap='break-word'>
        <Text>error: {JSON.stringify(error)}</Text>
      </Box>}
    </Box>
  );

}