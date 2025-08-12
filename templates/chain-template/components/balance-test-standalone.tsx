import React from 'react';
import { Box, Text, Button } from '@interchain-ui/react';
import { useGetBalance } from './codegen/cosmos/bank/v1beta1/query.rpc.react';

export const BalanceTestStandalone: React.FC = () => {
  // Hardcoded test wallet address
  const testAddress = 'osmo1hcp508gngdnpls4z76nlx78zuadqpyypq8t6as';
  const [selectedDenom, setSelectedDenom] = React.useState<string>('uosmo');
  
  // Use the codegen hook to get balance
  const { 
    data: balanceData, 
    isLoading, 
    error, 
    refetch,
    isRefetching 
  } = useGetBalance({
    request: {
      address: testAddress,
      denom: selectedDenom,
    },
    options: {
      enabled: true,
      refetchInterval: 30000, // Refetch every 30 seconds
    },
  });

  const denomOptions = ['uosmo', 'uion', 'uusdc', 'uatom'];

  return (
    <Box 
      p="$6" 
      borderRadius="$lg" 
      backgroundColor="$cardBg" 
      border="1px solid $borderColor"
      maxWidth="600px"
      mx="auto"
      mt="$8"
    >
      <Text fontSize="$xl" fontWeight="$bold" mb="$4">
        Standalone Balance Test (No Wallet Connection)
      </Text>
      
      <Box mb="$4" p="$3" backgroundColor="$gray50" borderRadius="$md">
        <Text fontSize="$sm" color="$textSecondary" mb="$1">
          Test Address (Osmosis Testnet):
        </Text>
        <Text fontSize="$xs" fontFamily="$mono" wordBreak="break-all">
          {testAddress}
        </Text>
      </Box>

      <Box mb="$4">
        <Text fontSize="$sm" fontWeight="$medium" mb="$2">
          Select Denomination:
        </Text>
        <Box display="flex" gap="$2" flexWrap="wrap">
          {denomOptions.map((denom) => (
            <Button
              key={denom}
              size="sm"
              variant={selectedDenom === denom ? 'primary' : 'secondary'}
              onClick={() => setSelectedDenom(denom)}
            >
              {denom}
            </Button>
          ))}
        </Box>
      </Box>

      <Box mb="$4">
        <Text fontSize="$sm" fontWeight="$medium" mb="$2">
          Query Status:
        </Text>
        
        {isLoading && (
          <Text color="$blue500" fontSize="$sm">
            🔄 Loading balance for {selectedDenom}...
          </Text>
        )}
        
        {isRefetching && !isLoading && (
          <Text color="$blue500" fontSize="$sm">
            🔄 Refreshing...
          </Text>
        )}

        {error && (
          <Box p="$3" backgroundColor="$red50" borderRadius="$md">
            <Text color="$red500" fontSize="$sm">
              ❌ Error: {error.message || 'Failed to fetch balance'}
            </Text>
          </Box>
        )}

        {balanceData && !isLoading && (
          <Box p="$3" backgroundColor="$green50" borderRadius="$md">
            <Text color="$green600" fontSize="$sm" mb="$2">
              ✅ Balance Query Successful
            </Text>
            <Box p="$2" backgroundColor="white" borderRadius="$sm">
              <Text fontSize="$sm" fontFamily="$mono">
                Denom: {balanceData.balance?.denom || selectedDenom}
              </Text>
              <Text fontSize="$sm" fontFamily="$mono">
                Amount: {balanceData.balance?.amount || '0'}
              </Text>
              {balanceData.balance?.amount && balanceData.balance.amount !== '0' && (
                <Text fontSize="$xs" color="$textSecondary" mt="$1">
                  = {(parseInt(balanceData.balance.amount) / 1_000_000).toFixed(6)} {selectedDenom.replace('u', '').toUpperCase()}
                </Text>
              )}
            </Box>
          </Box>
        )}

        {balanceData && !error && !balanceData.balance && (
          <Box p="$3" backgroundColor="$gray100" borderRadius="$md">
            <Text fontSize="$sm" color="$textSecondary">
              No balance found for {selectedDenom}
            </Text>
          </Box>
        )}
      </Box>

      <Box display="flex" gap="$2">
        <Button
          size="sm"
          variant="primary"
          onClick={() => refetch()}
          disabled={isLoading || isRefetching}
        >
          {isRefetching ? 'Refreshing...' : 'Refresh Balance'}
        </Button>
      </Box>

      <Box mt="$4" p="$3" backgroundColor="$gray50" borderRadius="$md">
        <Text fontSize="$xs" color="$textSecondary" mb="$1">
          <strong>Test Details:</strong>
        </Text>
        <Text fontSize="$xs" color="$textSecondary">
          • Using codegen hook: useGetBalance
        </Text>
        <Text fontSize="$xs" color="$textSecondary">
          • No wallet connection required
        </Text>
        <Text fontSize="$xs" color="$textSecondary">
          • Direct RPC query to Osmosis testnet
        </Text>
        <Text fontSize="$xs" color="$textSecondary">
          • Auto-refresh every 30 seconds
        </Text>
      </Box>
    </Box>
  );
};