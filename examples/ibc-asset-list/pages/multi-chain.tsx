import { useState } from 'react';
import { ReactNoSSR } from '@interchain-ui/react-no-ssr';
import { AssetListSection, Layout, WalletSection } from '@/components';

export default function MultiChain() {
  const [chainName, setChainName] = useState<string>();

  return (
    <Layout>
      <WalletSection
        isMultiChain
        providedChainName={chainName}
        setChainName={setChainName}
      />
      <ReactNoSSR>
        {chainName && <AssetListSection chainName={chainName} />}
      </ReactNoSSR>
    </Layout>
  );
}
