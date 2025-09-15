import React, { useState, useEffect } from 'react';
import { useChain } from '@interchain-kit/react';
import { useCustomSigningClient } from '../hooks/useCustomSigningClient';
import { getCosmWasmClient, getSigningCosmWasmClient } from '../codegen/baseClient';

interface ContractTestProps {
  chainName: string;
}

const ContractTest: React.FC<ContractTestProps> = ({ chainName }) => {
  const { chain, address, getRpcEndpoint } = useChain(chainName);
  const { data: signingClient } = useCustomSigningClient({ chainName });
  
  const [contractAddress, setContractAddress] = useState('');
  const [queryMsg, setQueryMsg] = useState('{}');
  const [executeMsg, setExecuteMsg] = useState('{}');
  const [queryResult, setQueryResult] = useState('');
  const [executeResult, setExecuteResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [rpcEndpoint, setRpcEndpoint] = useState<string | null>(null);

  useEffect(() => {
    const fetchRpcEndpoint = async () => {
      try {
        const endpoint = await getRpcEndpoint();
        if (typeof endpoint === 'string') {
          setRpcEndpoint(endpoint);
        } else if (endpoint && typeof endpoint === 'object' && 'url' in endpoint) {
          setRpcEndpoint((endpoint as any).url);
        }
      } catch (err) {
        console.error('Failed to get RPC endpoint:', err);
      }
    };
    fetchRpcEndpoint();
  }, [chainName]);

  const validateJson = (jsonString: string): string | null => {
    try {
      JSON.parse(jsonString);
      return null;
    } catch (err) {
      return (err as Error).message;
    }
  };

  const validateContractAddress = (address: string, prefix: string): string | null => {
    if (!address) return 'Contract address is required';
    if (!address.startsWith(prefix)) {
      return `Contract address must start with ${prefix}`;
    }
    return null;
  };

  const prettifyJson = (jsonString: string): string => {
    try {
      return JSON.stringify(JSON.parse(jsonString), null, 2);
    } catch {
      return jsonString;
    }
  };

  const handleQuery = async () => {
    if (!rpcEndpoint || !contractAddress) {
      setError('RPC endpoint and contract address are required');
      return;
    }

    const addressError = validateContractAddress(contractAddress, chain.bech32Prefix || 'cosmos');
    if (addressError) {
      setError(addressError);
      return;
    }

    const jsonError = validateJson(queryMsg);
    if (jsonError) {
      setError(`Invalid query JSON: ${jsonError}`);
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const client = getCosmWasmClient(rpcEndpoint);
      const result = await client.queryContractSmart(contractAddress, JSON.parse(queryMsg));
      setQueryResult(prettifyJson(JSON.stringify(result)));
    } catch (err) {
      setError(`Query failed: ${(err as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleExecute = async () => {
    if (!signingClient || !address || !contractAddress) {
      setError('Signing client, wallet address, and contract address are required');
      return;
    }

    const addressError = validateContractAddress(contractAddress, chain.bech32Prefix || 'cosmos');
    if (addressError) {
      setError(addressError);
      return;
    }

    const jsonError = validateJson(executeMsg);
    if (jsonError) {
      setError(`Invalid execute JSON: ${jsonError}`);
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const cosmWasmClient = getSigningCosmWasmClient(signingClient, rpcEndpoint || undefined);
      const result = await cosmWasmClient.execute(
        address,
        contractAddress,
        JSON.parse(executeMsg),
        'auto', // fee
        'Test execution from cosmwasm example', // memo
        [] // funds
      );
      setExecuteResult(prettifyJson(JSON.stringify(result, null, 2)));
    } catch (err) {
      setError(`Execute failed: ${(err as Error).message}`);
    } finally {
      setLoading(false);
    }
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
          fontSize: '1.5rem',
          marginRight: '0.75rem'
        }}>🔧</div>
        <h2 style={{
          fontSize: '1.5rem',
          fontWeight: '600',
          color: '#1a202c',
          margin: '0'
        }}>Contract Test Interface</h2>
      </div>
      
      <p style={{
        color: '#64748b',
        margin: '0 0 1.5rem 0',
        lineHeight: '1.6'
      }}>Test the query and execute functionality of CosmWasm contracts</p>
      
      {error && (
        <div style={{
          backgroundColor: '#fef2f2',
          border: '1px solid #fecaca',
          padding: '1rem',
          borderRadius: '8px',
          marginBottom: '1.5rem',
          color: '#dc2626'
        }}>
          <div style={{
            fontSize: '0.875rem',
            fontWeight: '500'
          }}>❌ {error}</div>
        </div>
      )}

      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{
          display: 'block',
          marginBottom: '0.5rem',
          fontSize: '0.875rem',
          fontWeight: '500',
          color: '#374151'
        }}>
          Contract Address
        </label>
        <input
          type="text"
          value={contractAddress}
          onChange={(e) => setContractAddress(e.target.value)}
          placeholder={`Enter contract address (${chain.bech32Prefix}...)`}
          style={{
            width: '100%',
            padding: '0.75rem',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            fontSize: '0.875rem',
            transition: 'border-color 0.2s ease',
            outline: 'none'
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = '#3b82f6';
            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = '#d1d5db';
            e.currentTarget.style.boxShadow = 'none';
          }}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        {/* Query Section */}
        <div style={{
          padding: '1.5rem',
          backgroundColor: '#f8fafc',
          borderRadius: '8px',
          border: '1px solid #e2e8f0'
        }}>
          <h3 style={{
            fontSize: '1.125rem',
            fontWeight: '600',
            color: '#1a202c',
            margin: '0 0 1rem 0',
            display: 'flex',
            alignItems: 'center'
          }}>
            <span style={{ marginRight: '0.5rem' }}>🔍</span>
            Query Contract
          </h3>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontSize: '0.875rem',
              fontWeight: '500',
              color: '#374151'
            }}>
              Query Message (JSON)
            </label>
            <textarea
              value={queryMsg}
              onChange={(e) => setQueryMsg(e.target.value)}
              placeholder='{"nft_info": {"token_id": "1"}}'
              rows={4}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '0.875rem',
                fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
                transition: 'border-color 0.2s ease',
                outline: 'none',
                resize: 'vertical'
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#3b82f6';
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#d1d5db';
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
          </div>
          <button
            onClick={handleQuery}
            disabled={loading || !rpcEndpoint}
            style={{
              width: '100%',
              padding: '0.75rem 1rem',
              backgroundColor: loading || !rpcEndpoint ? '#9ca3af' : '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: loading || !rpcEndpoint ? 'not-allowed' : 'pointer',
              fontSize: '0.875rem',
              fontWeight: '500',
              transition: 'background-color 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onMouseEnter={(e) => {
              if (!loading && rpcEndpoint) {
                e.currentTarget.style.backgroundColor = '#2563eb';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading && rpcEndpoint) {
                e.currentTarget.style.backgroundColor = '#3b82f6';
              }
            }}
          >
            {loading ? (
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
                Querying...
              </>
            ) : (
              'Query Contract'
            )}
          </button>
          
          {queryResult && (
            <div style={{ marginTop: '1rem' }}>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#374151'
              }}>
                Query Result
              </label>
              <pre style={{
                backgroundColor: 'white',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                padding: '1rem',
                fontSize: '0.75rem',
                fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
                overflow: 'auto',
                maxHeight: '200px',
                color: '#374151'
              }}>
                {queryResult}
              </pre>
            </div>
          )}
        </div>

        {/* Execute Section */}
        <div style={{
          padding: '1.5rem',
          backgroundColor: '#f0fdf4',
          borderRadius: '8px',
          border: '1px solid #bbf7d0'
        }}>
          <h3 style={{
            fontSize: '1.125rem',
            fontWeight: '600',
            color: '#1a202c',
            margin: '0 0 1rem 0',
            display: 'flex',
            alignItems: 'center'
          }}>
            <span style={{ marginRight: '0.5rem' }}>⚡</span>
            Execute Contract
          </h3>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontSize: '0.875rem',
              fontWeight: '500',
              color: '#374151'
            }}>
              Execute Message (JSON)
            </label>
            <textarea
              value={executeMsg}
              onChange={(e) => setExecuteMsg(e.target.value)}
              placeholder='{"mint": {"token_id": "1", "owner": "stars1...", "token_uri": "https://example.com/metadata.json"}}'
              rows={4}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '0.875rem',
                fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
                transition: 'border-color 0.2s ease',
                outline: 'none',
                resize: 'vertical'
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#10b981';
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.1)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#d1d5db';
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
          </div>
          <button
            onClick={handleExecute}
            disabled={loading || !signingClient || !address}
            style={{
              width: '100%',
              padding: '0.75rem 1rem',
              backgroundColor: loading || !signingClient || !address ? '#9ca3af' : '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: loading || !signingClient || !address ? 'not-allowed' : 'pointer',
              fontSize: '0.875rem',
              fontWeight: '500',
              transition: 'background-color 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onMouseEnter={(e) => {
              if (!loading && signingClient && address) {
                e.currentTarget.style.backgroundColor = '#059669';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading && signingClient && address) {
                e.currentTarget.style.backgroundColor = '#10b981';
              }
            }}
          >
            {loading ? (
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
                Executing...
              </>
            ) : (
              'Execute Contract'
            )}
          </button>
          
          {!address && (
            <p style={{
              fontSize: '0.75rem',
              color: '#64748b',
              marginTop: '0.5rem',
              textAlign: 'center'
            }}>
              Connect wallet to execute transactions
            </p>
          )}
          
          {executeResult && (
            <div style={{ marginTop: '1rem' }}>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#374151'
              }}>
                Execute Result
              </label>
              <pre style={{
                backgroundColor: 'white',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                padding: '1rem',
                fontSize: '0.75rem',
                fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
                overflow: 'auto',
                maxHeight: '200px',
                color: '#374151'
              }}>
                {executeResult}
              </pre>
            </div>
          )}
        </div>
      </div>

      <div style={{
        marginTop: '2rem',
        padding: '1.5rem',
        backgroundColor: '#f8fafc',
        borderRadius: '8px',
        border: '1px solid #e2e8f0'
      }}>
        <h4 style={{
          fontSize: '1rem',
          fontWeight: '600',
          color: '#1a202c',
          margin: '0 0 1rem 0',
          display: 'flex',
          alignItems: 'center'
        }}>
          <span style={{ marginRight: '0.5rem' }}>📊</span>
          Connection Status
        </h4>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '0.75rem'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            fontSize: '0.875rem',
            color: '#374151'
          }}>
            <span style={{ marginRight: '0.5rem' }}>🔗</span>
            <strong>Chain:</strong>
            <span style={{ marginLeft: '0.5rem' }}>{chain.chainName}</span>
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            fontSize: '0.875rem',
            color: '#374151'
          }}>
            <span style={{ marginRight: '0.5rem' }}>{rpcEndpoint ? '✅' : '❌'}</span>
            <strong>RPC:</strong>
            <span style={{ marginLeft: '0.5rem' }}>{rpcEndpoint ? 'Connected' : 'Not available'}</span>
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            fontSize: '0.875rem',
            color: '#374151'
          }}>
            <span style={{ marginRight: '0.5rem' }}>{address ? '✅' : '❌'}</span>
            <strong>Wallet:</strong>
            <span style={{
              marginLeft: '0.5rem',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              maxWidth: '120px'
            }}>{address || 'Not connected'}</span>
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            fontSize: '0.875rem',
            color: '#374151'
          }}>
            <span style={{ marginRight: '0.5rem' }}>{signingClient ? '✅' : '❌'}</span>
            <strong>Signing Client:</strong>
            <span style={{ marginLeft: '0.5rem' }}>{signingClient ? 'Ready' : 'Not available'}</span>
          </div>
        </div>
      </div>
      
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default ContractTest;
export type { ContractTestProps };