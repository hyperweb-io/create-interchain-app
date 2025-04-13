// import { Secp256k1Auth } from "@interchainjs/auth/secp256k1";
// import { EthSecp256k1Auth } from "@interchainjs/auth/ethSecp256k1";
// import { HDPath } from "@interchainjs/types";

// // Why do we have two signers for Cosmos and Injective? I'd like to just import one and that's it.
// import { DirectSigner } from "@interchainjs/cosmos/signers/direct";
// import { DirectSigner as InjectiveDirectSigner } from "@interchainjs/injective/signers/direct";

// // What is this, where in the docs can I read about this?
// import { toEncoder } from "@interchainjs/cosmos/utils";

// // Why is this on interchainjs package and not in a @interchainjs package? we need unified way to import types
// import { MsgSend } from "interchainjs/cosmos/bank/v1beta1/tx";
// import { MessageComposer } from "interchainjs/cosmos/bank/v1beta1/tx.registry";

// // These imports are confusing, we need abstractions for types and rpc functions (similar to what cosmjs did)
// // and the worst part is that there is no documentation on how to use this
// import { createGetBalance } from "@interchainjs/cosmos-types/cosmos/bank/v1beta1/query.rpc.func";
// import { createQueryRpc } from "@interchainjs/utils";
// import { QueryBalanceRequest } from "@interchainjs/cosmos-types/cosmos/bank/v1beta1/query";
// import { DEFAULT_GAS_LIMIT } from "@injectivelabs/utils";

// const INJECTIVE_RPC_URL = "https://testnet.sentry.tm.injective.network";
// const OSMOSIS_RPC_URL = "https://rpc.osmotest5.osmosis.zone";

// const getFee = (denom: string, amount: string) => {
//   return {
//     amount: [
//       {
//         denom,
//         amount: amount,
//       },
//     ],
//     gas: DEFAULT_GAS_LIMIT.toString(),
//   };
// };

// const getMessages = (address: string, denom: string, amount = "1") => {
//   return [
//     MessageComposer.withTypeUrl.send({
//       fromAddress: address,
//       toAddress: address,
//       amount: [
//         {
//           denom,
//           amount,
//         },
//       ],
//     }),
//   ];
// };

// const getAuth = () => {
//   const mnemonic = process.env.SEED_PHRASE;

//   if (!mnemonic) {
//     throw new Error("SEED_PHRASE is not set");
//   }

//   const [cosmosAuth] = Secp256k1Auth.fromMnemonic(mnemonic, [
//     HDPath.cosmos().toString(),
//   ]);
//   const [injectiveAuth] = EthSecp256k1Auth.fromMnemonic(mnemonic, [
//     HDPath.eth().toString(),
//   ]);

//   return {
//     cosmosAuth,
//     injectiveAuth,
//   };
// };

// const getSigners = () => {
//   return {
//     osmosisSigner: new DirectSigner(
//       getAuth().cosmosAuth,
//       [toEncoder(MsgSend)],
//       OSMOSIS_RPC_URL
//     ),
//     injectiveSigner: new InjectiveDirectSigner(
//       getAuth().injectiveAuth,
//       [toEncoder(MsgSend)],
//       INJECTIVE_RPC_URL
//     ),
//   };
// };

// const main = async () => {
//   const { osmosisSigner, injectiveSigner } = getSigners();

//   console.log("osmo address", await osmosisSigner.getAddress());
//   console.log("inj address", await injectiveSigner.getAddress());

//   const osmoBalanceQuery = createGetBalance(createQueryRpc(OSMOSIS_RPC_URL));
//   const injBalanceQuery = createGetBalance(createQueryRpc(INJECTIVE_RPC_URL));

//   console.log(
//     "osmo balance",
//     await osmoBalanceQuery(
//       QueryBalanceRequest.fromPartial({
//         address: await osmosisSigner.getAddress(),
//         denom: "uosmo",
//       })
//     )
//   );

//   console.log(
//     "inj balance",
//     await injBalanceQuery(
//       QueryBalanceRequest.fromPartial({
//         address: await injectiveSigner.getAddress(),
//         denom: "inj",
//       })
//     )
//   );

//   const txOsmosis = await osmosisSigner.signAndBroadcast(
//     {
//       messages: getMessages(await osmosisSigner.getAddress(), "uosmo"),
//       fee: getFee("uosmo", "10000000"),
//       memo: "send tokens test OSMO",
//     },
//     { deliverTx: true }
//   );

//   console.log("txOsmosis", txOsmosis);

//   const txInjective = await injectiveSigner.signAndBroadcast(
//     {
//       messages: getMessages(await injectiveSigner.getAddress(), "inj"),
//       fee: getFee("inj", "16000000000"),
//       memo: "send tokens test INJ",
//     },
//     { deliverTx: true }
//   );

//   console.log("txInjective", txInjective);
// };

import path from 'path';
import { ConfigContext, generateMnemonic, useRegistry } from 'starshipjs';
import { useChain } from 'starshipjs';

import { defaultSignerOptions } from '@interchainjs/injective/defaults';
import { DirectSigner } from '@interchainjs/cosmos/signers/direct';

import { getBalance } from "injectivejs/cosmos/bank/v1beta1/query.rpc.func";

import { EthSecp256k1Auth } from '@interchainjs/auth/ethSecp256k1';
import { HDPath } from '@interchainjs/types';

import { sleep } from '@interchainjs/utils';

const main = async () => {
  // initialize starship
  const configFile = path.join(__dirname, 'starship', 'configs', 'config.yaml');
  ConfigContext.setConfigFile(configFile);
  ConfigContext.setRegistry(await useRegistry(configFile));

  const { chainInfo, getCoin, getRpcEndpoint, creditFromFaucet } =
    useChain('injective');

  const denom = (await getCoin()).base;

  const injRpcEndpoint = await getRpcEndpoint();

  const mnemonic = generateMnemonic();

  // Initialize auth and signer
  const [auth] = EthSecp256k1Auth.fromMnemonic(mnemonic, [
    HDPath.eth().toString(),
  ]);
  const directSigner = new DirectSigner(
    auth,
    [],
    injRpcEndpoint,
    defaultSignerOptions.Cosmos
  );
  const address = await directSigner.getAddress();

  await creditFromFaucet(address);

  await sleep(5000);

  const { balance } = await getBalance(injRpcEndpoint, {
    address: address,
    denom,
  });

  console.log(`starship's initialized and ${address} has been credited with ${balance!.amount} ${denom}`);

};

// Call the main function
main().catch(console.error);
