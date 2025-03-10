export type Project = {
  name: string;
  desc: string;
  link: string;
};

export const products: Project[] = [
  {
    name: 'Interchain JS',
    desc: 'A single, universal signing interface for any network. Birthed from the interchain ecosystem for builders. Create adapters for any web3 network.',
    link: 'https://github.com/hyperweb-io/interchainjs',
  },
  {
    name: 'Interchain Kit',
    desc: 'A wallet adapter for react with mobile WalletConnect support for the Cosmos ecosystem.',
    link: 'https://github.com/hyperweb-io/interchain-kit',
  },
  {
    name: 'Telescope',
    desc: 'A TypeScript Transpiler for Cosmos Protobufs to generate libraries for Cosmos blockchains.',
    link: 'https://github.com/hyperweb-io/telescope',
  },
  {
    name: 'Chain Registry',
    desc: 'Get chain and asset list information from the npm package for the Official Cosmos chain registry.',
    link: 'https://github.com/hyperweb-io/chain-registry',
  },
  {
    name: 'TS Codegen',
    desc: 'The quickest and easiest way to convert CosmWasm Contracts into dev-friendly TypeScript classes.',
    link: 'https://github.com/CosmWasm/ts-codegen',
  },
  {
    name: 'Docs',
    desc: 'How-to videos from the official Hyperweb website, with learning resources for building in Cosmos.',
    link: 'https://hyperweb.io/learn',
  },
];

export const dependencies: Project[] = [
  {
    name: 'Interchain UI',
    desc: 'Cross-framework UI Kit for Crafting dApps.',
    link: 'https://github.com/hyperweb-io/interchain-ui',
  },
  {
    name: 'Next.js',
    desc: 'A React Framework supports hybrid static & server rendering.',
    link: 'https://nextjs.org/',
  },
];
