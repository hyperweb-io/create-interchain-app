# CosmWasm TypeScript Codegen Example

This example demonstrates how to use CosmWasm Ts-Codegen TypeScript code generation with create-interchain-app. It showcases type-safe interactions with CosmWasm smart contracts using automatically generated TypeScript clients. The demo is mainly for baseCient functionality including query and execute, but you can add or modify to do the test for other clients.

## Features

- 🔗 **Wallet Integration**: Connect to Cosmos wallets using @interchain-kit
- 📝 **Type Safety**: Fully typed contract interactions using generated TypeScript clients
- ⚡ **Real-time Updates**: Live contract state queries and transaction execution

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- A Cosmos wallet (Keplr recommended)
- Access to a Cosmos testnet (Stargaze testnet configured by default)

### Installation

1. Navigate to the example:
   ```bash
   cd examples/cosmwasm
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Code Generation

The TypeScript clients in the `/codegen` directory are automatically generated from CosmWasm contract schemas using `@cosmwasm/ts-codegen`. 

## Configuration

### Supported Chains

The example is configured to work with:
- **Osmosis Testnet** (default)
- **Stargaze** 
- **Juno**

You can modify the chain configuration in `/config/chains.ts` to add support for additional networks.

### Wallet Support

Supported wallets include:
- **Keplr** (recommended)
- **Leap**
- **MetaMask** (for Ethereum-compatible chains)

Wallet configuration is managed in `/config/wallets.ts`.

## Development

### Adding New Contract Types

1. Add your contract schema to the project
2. Generate TypeScript clients using `@cosmwasm/ts-codegen`
3. Create React components for contract interactions
4. Add the components to the main page

## Troubleshooting

### Common Issues

1. **Wallet Connection Fails**
   - Ensure Keplr or another supported wallet is installed
   - Check that the wallet supports the selected chain
   - Verify network configuration in wallet settings

2. **Contract Queries Fail**
   - Verify the contract address is correct
   - Ensure the contract exists on the selected network
   - Check RPC endpoint connectivity

3. **Transaction Execution Fails**
   - Verify sufficient balance for gas fees
   - Check message format matches contract expectations
   - Ensure proper permissions for contract execution

### Getting Help

- Check the [CosmWasm Ts-Codegen documentation](https://github.com/hyperweb-io/ts-codegen)
- View [Interchainjs documentation](https://github.com/hyperweb-io/interchainjs)
