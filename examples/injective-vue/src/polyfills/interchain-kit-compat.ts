import { WalletManager, WalletState } from '@interchain-kit/core';

// Runtime polyfill: older @interchain-kit/core versions may not expose getCurrentWallet,
// but @interchain-kit/vue expects it. Provide a minimal implementation.
const proto: any = (
  WalletManager as unknown as { prototype?: Record<string, unknown> }
)?.prototype;

if (proto && typeof (proto as any).getCurrentWallet !== 'function') {
  (proto as any).getCurrentWallet = function () {
    try {
      const wallets: any[] = (this as any)?.wallets ?? [];
      return wallets.find((w: any) => w?.walletState === WalletState.Connected);
    } catch {
      return undefined;
    }
  };
}
