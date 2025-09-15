import { WalletSection } from '../components/WalletSection';
import ContractTest from '../components/ContractTest';

export default function Home() {
  const chainName = 'osmosistestnet';

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f8fafc',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    }}>
      {/* Header */}
      <div style={{
        backgroundColor: 'white',
        borderBottom: '1px solid #e2e8f0',
        padding: '2rem 0',
        marginBottom: '2rem'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 1.5rem',
          textAlign: 'center'
        }}>
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: '700',
            color: '#1a202c',
            margin: '0 0 0.5rem 0'
          }}>CosmWasm ts-codegen</h1>
          <p style={{
            fontSize: '1.125rem',
            color: '#64748b',
            margin: '0',
            maxWidth: '600px',
            marginLeft: 'auto',
            marginRight: 'auto'
          }}>Interact with CosmWasm smart contracts using type-safe TypeScript clients</p>
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 1.5rem'
      }}>
        <div style={{
          display: 'grid',
          gap: '2rem',
          gridTemplateColumns: '1fr',
          maxWidth: '800px',
          margin: '0 auto'
        }}>
          <WalletSection chainName={chainName} />
          <ContractTest chainName={chainName} />
          
          {/* Info Card */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '2rem',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
            border: '1px solid #e2e8f0'
          }}>
            <h3 style={{
              fontSize: '1.25rem',
              fontWeight: '600',
              color: '#1a202c',
              margin: '0 0 1rem 0'
            }}>About this Example</h3>
            <p style={{
              color: '#64748b',
              margin: '0 0 1rem 0',
              lineHeight: '1.6'
            }}>This example demonstrates the power of CosmWasm ts-codegen integration:</p>
            <ul style={{
              color: '#64748b',
              margin: '0 0 1rem 0',
              paddingLeft: '1.5rem',
              lineHeight: '1.6'
            }}>
              <li style={{ marginBottom: '0.5rem' }}>🔗 Seamless wallet connection with @interchain-kit</li>
              <li style={{ marginBottom: '0.5rem' }}>📝 Type-safe CosmWasm contract interactions</li>
              <li style={{ marginBottom: '0.5rem' }}>⚡ Automatic TypeScript code generation from schemas</li>
              <li style={{ marginBottom: '0.5rem' }}>🔍 Generic contract testing interface for any CosmWasm contract</li>
            </ul>
            <p style={{
              color: '#64748b',
              margin: '0',
              lineHeight: '1.6',
              fontSize: '0.875rem'
            }}>The generated TypeScript clients provide complete type safety and IntelliSense support for your contract interactions.</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{
        marginTop: '4rem',
        padding: '2rem 0',
        textAlign: 'center',
        color: '#94a3b8',
        fontSize: '0.875rem'
      }}>
        Built with create-interchain-app
      </div>
    </div>
  );
}