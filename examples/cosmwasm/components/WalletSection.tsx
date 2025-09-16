import { useState } from 'react';
import { useChain, useChainWallet } from '@interchain-kit/react';
import { WalletState } from '@interchain-kit/core';
import { wallets } from '../config/wallets';

interface WalletSectionProps {
  chainName: string;
}

export const WalletSection = ({ chainName }: WalletSectionProps) => {
  const { address } = useChain(chainName);
  const [selectedWalletName, setSelectedWalletName] = useState<string | null>(null);
  const { connect, disconnect, status } = useChainWallet(
    chainName,
    selectedWalletName || 'keplr-extension'
  );
  
  const isWalletConnected = !!address;

  const handleWalletSelect = (walletName: string) => {
    setSelectedWalletName(walletName);
    // Connect will be called automatically by useChainWallet when selectedWalletName changes
    setTimeout(() => connect(), 100);
  };

  const handleDisconnect = () => {
    disconnect();
    setSelectedWalletName(null);
  };

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '2rem',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
      border: '1px solid #e2e8f0'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        marginBottom: '1.5rem'
      }}>
        <div style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          backgroundColor: isWalletConnected ? '#10b981' : '#6b7280',
          marginRight: '0.75rem'
        }}></div>
        <h2 style={{
          fontSize: '1.5rem',
          fontWeight: '600',
          color: '#1a202c',
          margin: '0'
        }}>Wallet Connection</h2>
      </div>
      
      {!isWalletConnected ? (
        <div>
          <p style={{
            color: '#64748b',
            margin: '0 0 1.5rem 0',
            lineHeight: '1.6'
          }}>Connect your wallet to interact with CosmWasm contracts</p>
          
          <div style={{
            display: 'grid',
            gap: '0.75rem',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))'
          }}>
            {wallets.map((wallet) => (
              <button 
                key={wallet.info?.name}
                onClick={() => handleWalletSelect(wallet.info?.name || '')}
                style={{
                  padding: '0.875rem 1.25rem',
                  backgroundColor: selectedWalletName === wallet.info?.name ? '#3b82f6' : 'white',
                  color: selectedWalletName === wallet.info?.name ? 'white' : '#374151',
                  border: '1px solid #d1d5db',
                  borderColor: selectedWalletName === wallet.info?.name ? '#3b82f6' : '#d1d5db',
                  borderRadius: '8px',
                  cursor: status === WalletState.Connecting ? 'not-allowed' : 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  transition: 'all 0.2s ease',
                  opacity: status === WalletState.Connecting ? 0.6 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: '44px'
                }}
                disabled={status === WalletState.Connecting}
                onMouseEnter={(e) => {
                  if (status !== WalletState.Connecting && selectedWalletName !== wallet.info?.name) {
                    e.currentTarget.style.borderColor = '#9ca3af';
                    e.currentTarget.style.backgroundColor = '#f9fafb';
                  }
                }}
                onMouseLeave={(e) => {
                  if (status !== WalletState.Connecting && selectedWalletName !== wallet.info?.name) {
                    e.currentTarget.style.borderColor = '#d1d5db';
                    e.currentTarget.style.backgroundColor = 'white';
                  }
                }}
              >
                {status === WalletState.Connecting && selectedWalletName === wallet.info?.name ? (
                  <>
                    <div style={{
                      width: '16px',
                      height: '16px',
                      border: '2px solid transparent',
                      borderTop: '2px solid currentColor',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite',
                      marginRight: '0.5rem'
                    }}></div>
                    Connecting...
                  </>
                ) : (
                  `Connect ${wallet.info?.prettyName || wallet.info?.name}`
                )}
              </button>
            ))}
          </div>
          
          {status === WalletState.Rejected && (
            <div style={{
              marginTop: '1rem',
              padding: '0.75rem',
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '8px',
              color: '#dc2626',
              fontSize: '0.875rem'
            }}>
              ⚠️ Connection rejected. Please try again or check your wallet settings.
            </div>
          )}
        </div>
      ) : (
        <div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '1rem',
            padding: '1rem',
            backgroundColor: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: '8px'
          }}>
            <div style={{
              fontSize: '1.25rem',
              marginRight: '0.75rem'
            }}>✅</div>
            <div>
              <p style={{
                margin: '0',
                fontWeight: '600',
                color: '#166534'
              }}>Wallet Connected</p>
              <p style={{
                margin: '0.25rem 0 0 0',
                fontSize: '0.875rem',
                color: '#166534',
                fontFamily: 'monospace',
                wordBreak: 'break-all'
              }}>{address}</p>
            </div>
          </div>
          
          <button 
            onClick={handleDisconnect}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '500',
              transition: 'background-color 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#dc2626';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#ef4444';
            }}
          >
            Disconnect Wallet
          </button>
        </div>
      )}
      
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};