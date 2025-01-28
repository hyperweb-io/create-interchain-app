# create-interchain-app

<p align="center" width="100%">
    <img height="148" src="https://user-images.githubusercontent.com/545047/186589196-e75c9540-86a7-4a71-8096-207be9a4216f.svg" />
</p>

<p align="center" width="100%">
   <a href="https://www.npmjs.com/package/create-interchain-app"><img height="20" src="https://img.shields.io/npm/dt/create-interchain-app"></a>
   <a href="https://github.com/hyperweb-io/create-interchain-app/blob/main/LICENSE"><img height="20" src="https://img.shields.io/badge/license-MIT-blue.svg"></a>
   <a href="https://www.npmjs.com/package/create-interchain-app"><img height="20" src="https://img.shields.io/github/package-json/v/hyperweb-io/create-interchain-app?filename=packages%2Fcreate-interchain-app%2Fpackage.json"></a>
</p>

Set up a modern Cosmos app by running one command ⚛️

- [Overview](#overview)
- [Education & Resources](#education--resources)
- [Creating an App](#creating-an-app)
- [Examples](#examples)
- [Options](#options)
- [Development](#development)

https://user-images.githubusercontent.com/545047/192061992-f0e1106d-f4b2-4879-ab0a-896f22ee4f49.mp4


## Overview

First, install `create-interchain-app` globally using npm:

```sh
npm install -g create-interchain-app
```

Then, create your new Cosmos app by running the following command:

```sh
# you can also use `cia` instead of `create-interchain-app` for shortcut ;)
create-interchain-app
```

During the setup process, you'll be prompted to enter the name of your app. For example:

```plaintext
> name: my-app
```

Once the app is created, move into the app directory and start the development server:

```sh
cd my-app
yarn && yarn dev
```

Now your app should be running on `http://localhost:3000`!

### Get Started Immediately

#### Interchain JavaScript Stack Template

This template provides everything you need to build modern Interchain applications. You don't need to install or configure interchainjs, keplr, nextjs, webpack or Babel.

Everything is preconfigured, ready-to-go, so you can focus on your code!

- ⚡️ Connect easily to 20+ wallets via [Interchain Kit](https://github.com/hyperweb-io/interchain-kit) — including Ledger, Keplr, Cosmostation, Leap, Trust Wallet, OKX, XDEFI, Exodus, Wallet Connect and more!
- ⚛️ Sign and broadcast with [InterchainJS](https://github.com/hyperweb-io/interchainjs)
- 🎨 Build awesome UI with [Interchain UI](https://hyperweb.io/products/interchain-ui) and [Explore Components](https://hyperweb.io/components)
- 🛠 Render pages with [next.js](https://nextjs.org/) hybrid static & server rendering
- 📝 Leverage [chain-registry](https://github.com/hyperweb-io/chain-registry) for Chain and Asset info for all IBC-connected chains

## Education & Resources

🎥 [Checkout our videos](https://hyperweb.io/learn) to learn to learn more about `create-interchain-app` and tooling for building frontends in the Cosmos!

Checkout [interchain-kit](https://github.com/hyperweb-io/interchain-kit) for more docs as well as [interchain-kit/react](https://github.com/hyperweb-io/interchain-kit/tree/main/packages/react#signing-clients) for getting cosmjs stargate and cosmjs signers.

## Creating an App

To create a new app, you may choose one of the following methods:

### global install

```sh
npm install -g create-interchain-app
```

Then run the command:

```sh
create-interchain-app
```

we also made an alias `cia` if you don't want to type `create-interchain-app`:

```sh
cia
```

### npx

```sh
npx create-interchain-app
```

### npm

```sh
npm init interchain-app
```

### Yarn

```sh
yarn create interchain-app
```

## Examples

The `create-interchain-app` tool provides a range of examples to help you understand and test various features and integrations. By executing the examples, you can quickly see how to implement specific functionalities in your Cosmos app.

```
cia --example
```

If you know the example name, you can do

```
cia --example <example-name>
```

Alternatively, you can use the shorthand `-e` flag to achieve the same:

```
cia -e <example-name>
```

This command will generate a new project configured with the selected example, allowing you to dive into the code and functionality right away.

### Stake Tokens

<p align="center" width="100%">
    <img height="48" src="https://user-images.githubusercontent.com/545047/186589196-e75c9540-86a7-4a71-8096-207be9a4216f.svg" />
</p>

Initiate and manage staking operations directly within your application, allowing users to stake tokens securely and efficiently.


```
cia --name stake-example --example stake-tokens
```

### Vote Proposal

<p align="center" width="100%">
    <img height="48" src="https://user-images.githubusercontent.com/545047/186589196-e75c9540-86a7-4a71-8096-207be9a4216f.svg" />
</p>

Facilitate on-chain governance by enabling users to vote on proposals, enhancing community engagement and decision-making.

```
cia --name vote-example --example vote-proposal
```

### Authz

<p align="center" width="100%">
    <img height="48" src="https://user-images.githubusercontent.com/545047/186589196-e75c9540-86a7-4a71-8096-207be9a4216f.svg" />
</p>

Leverage the Authz module to grant and manage authorizations, allowing users to perform actions on behalf of others.

```
cia --name authz-example --example authz
```

### Asset List

<p align="center" width="100%">
    <img height="48" src="https://user-images.githubusercontent.com/545047/184519024-2d34bf20-2440-4837-943f-4915a46409f5.svg" />
</p>

Create and manage an asset list, offering comprehensive insights into the available assets, and empower your application with Inter-Blockchain Communication (IBC) capabilities for transferring tokens across different chains.

```
cia --name ibc-asset-list-example --example ibc-asset-list
```

## Options

| Argument             | Description                                    | Default    |
|----------------------|------------------------------------------------|------------|
| `--repo`             | Set custom repository for cia templates        | None       |
| `--install`          | Automatically install dependencies             | `true`     |
| `--printCmd`         | Print the command to run after setup           | `true`     |
| `-n`, `--name`       | Provide a project name                         | None       |
| `-e`, `--example`    | Provide an example name                        | None       |
| `-t`, `--template`   | Define the template to use                     | None       |
| `-b`, `--fromBranch` | Specify the branch to use for cloning          | None       |

## Development

Because the nature of how template boilerplates are generated, we generate `yarn.lock` files inside of nested packages so we can fix versions to avoid non-deterministic installations.

When adding packages, yarn workspaces will use the root `yarn.lock`. It could be ideal to remove it while adding packages, and when publishing or pushing new changes, generating the nested lock files.

In the root, to remove all nested lock files:

```
yarn locks:remove
```

When you need to remove/generate locks for all nested packages, simply run `yarn locks` in the root:

```
yarn locks
```

## Interchain JavaScript Stack 

A unified toolkit for building applications and smart contracts in the Interchain ecosystem ⚛️

| Category             | Tools                                                                                                                  | Status                                                                                                 |
|----------------------|------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------|
| **Chain Information**   | [**Chain Registry**](https://github.com/hyperweb-io/chain-registry), [**Utils**](https://www.npmjs.com/package/@chain-registry/utils), [**Client**](https://www.npmjs.com/package/@chain-registry/client) | Everything from token symbols, logos, and IBC denominations for all assets you want to support in your application. |
| **Wallet Connectors**| [**Interchain Kit**](https://github.com/hyperweb-io/interchain-kit)<sup>beta</sup>, [**Cosmos Kit**](https://github.com/cosmology-tech/cosmos-kit) | Experience the convenience of connecting with a variety of web3 wallets through a single, streamlined interface. |
| **Signing Clients**          | [**InterchainJS**](https://github.com/hyperweb-io/interchainjs)<sup>beta</sup>, [**CosmJS**](https://github.com/cosmos/cosmjs) | A single, universal signing interface for any network |
| **SDK Clients**              | [**Telescope**](https://github.com/cosmology-tech/telescope)                                                          | Your Frontend Companion for Building with TypeScript with Cosmos SDK Modules. |
| **Starter Kits**     | [**Create Interchain App**](https://github.com/hyperweb-io/create-interchain-app)<sup>beta</sup>, [**Create Cosmos App**](https://github.com/cosmology-tech/create-cosmos-app) | Set up a modern Interchain app by running one command. |
| **UI Kits**          | [**Interchain UI**](https://github.com/cosmology-tech/interchain-ui)                                                   | The Interchain Design System, empowering developers with a flexible, easy-to-use UI kit. |
| **Testing Frameworks**          | [**Starship**](https://github.com/cosmology-tech/starship)                                                             | Unified Testing and Development for the Interchain. |
| **TypeScript Smart Contracts** | [**Create Hyperweb App**](https://github.com/hyperweb-io/create-hyperweb-app)                              | Build and deploy full-stack blockchain applications with TypeScript |
| **CosmWasm Contracts** | [**CosmWasm TS Codegen**](https://github.com/CosmWasm/ts-codegen)                                                   | Convert your CosmWasm smart contracts into dev-friendly TypeScript classes. |

## Credits

🛠 Built by Hyperweb (formerly Cosmology) — if you like our tools, please checkout and contribute to [our github ⚛️](https://github.com/hyperweb-io)

## Disclaimer

AS DESCRIBED IN THE LICENSES, THE SOFTWARE IS PROVIDED “AS IS”, AT YOUR OWN RISK, AND WITHOUT WARRANTIES OF ANY KIND.

No developer or entity involved in creating this software will be liable for any claims or damages whatsoever associated with your use, inability to use, or your interaction with other users of the code, including any direct, indirect, incidental, special, exemplary, punitive or consequential damages, or loss of profits, cryptocurrencies, tokens, or anything else of value.
