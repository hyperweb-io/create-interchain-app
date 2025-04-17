import path from 'path';
import { ConfigContext, generateMnemonic, useRegistry } from 'starshipjs';
import { useChain } from 'starshipjs';

import { defaultSignerOptions } from '@interchainjs/injective/defaults';
import { DirectSigner } from '@interchainjs/cosmos/signers/direct';

import { getBalance } from 'injectivejs/cosmos/bank/v1beta1/query.rpc.func';
import { send } from 'injectivejs/cosmos/bank/v1beta1/tx.rpc.func';

import { Secp256k1Auth } from '@interchainjs/auth/secp256k1';
import { EthSecp256k1Auth } from '@interchainjs/auth/ethSecp256k1';
import { HDPath } from '@interchainjs/types';

import { sleep } from '@interchainjs/utils';
import { MsgSend } from 'injectivejs/cosmos/bank/v1beta1/tx';

const main = async () => {
  // initialize starship
  const configFile = path.join(__dirname, '..', 'configs', 'config.yaml');
  ConfigContext.setConfigFile(configFile);
  ConfigContext.setRegistry(await useRegistry(configFile));

  const { chainInfo, getCoin, getRpcEndpoint, creditFromFaucet } =
    useChain('injective');

  const denom = (await getCoin()).base;

  const rpcEndpoint = await getRpcEndpoint();

  const injMnemonic = generateMnemonic();
  const cosmosMnemonic = generateMnemonic();

  // Initialize auth and signer
  const [injAuth] = EthSecp256k1Auth.fromMnemonic(injMnemonic, [
    HDPath.eth().toString(),
  ]);
  const [cosmosAuth] = Secp256k1Auth.fromMnemonic(cosmosMnemonic, [
    HDPath.cosmos().toString(),
  ]);
  const injDirectSigner = new DirectSigner(
    injAuth,
    [],
    rpcEndpoint,
    defaultSignerOptions.Cosmos,
    {
      checkTx: true,
      deliverTx: true,
    }
  );

  const cosmosDirectSigner = new DirectSigner(
    cosmosAuth,
    [],
    rpcEndpoint,
    undefined,
    { checkTx: true, deliverTx: true }
  );

  const injAddress = await injDirectSigner.getAddress();
  const cosmosAddress = await cosmosDirectSigner.getAddress();
  await creditFromFaucet(injAddress);
  await creditFromFaucet(cosmosAddress);

  await sleep(5000);

  const { balance: injBalance } = await getBalance(rpcEndpoint, {
    address: injAddress,
    denom,
  });

  const { balance: cosmosBalance } = await getBalance(rpcEndpoint, {
    address: cosmosAddress,
    denom,
  });

  console.log(
    `starship's initialized and ${injAddress} has been credited with ${
      injBalance!.amount
    } ${denom}`
  );

  console.log(
    `starship's initialized and ${cosmosAddress} has been credited with ${
      cosmosBalance!.amount
    } ${denom}`
  );

  const fee = {
    amount: [
      {
        denom,
        amount: '100000',
      },
    ],
    gas: '550000',
  };

  const token = {
    amount: '10000000',
    denom,
  };

  const memo = 'send tokens test INJ';

  // from inj to cosmos
  const tx = await send(
    injDirectSigner,
    injAddress,
    MsgSend.fromPartial({
      fromAddress: injAddress,
      toAddress: cosmosAddress,
      amount: [token],
    }),
    fee,
    memo
  );

  if (tx.code !== 0) {
    console.error(tx);
    throw new Error('tx failed');
  }

  const { balance: cosmosBalanceAfter } = await getBalance(rpcEndpoint, {
    address: cosmosAddress,
    denom,
  });

  console.log(
    `cosmos balance after sending tokens: ${cosmosBalanceAfter!.amount} ${denom}`
  );
};

// Call the main function
main().catch(console.error);
