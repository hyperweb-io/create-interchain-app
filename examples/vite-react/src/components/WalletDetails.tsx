import { Box, Text, IconButton } from '@interchain-ui/react';
import { DENOM_DISPLAY } from '../utils/constants';
import { useState } from 'react';

interface WalletDetailsProps {
  address: string;
  balance: number | string;
  onRefresh: () => void;
}

const WalletDetails = ({ address, balance, onRefresh }: WalletDetailsProps) => {
  const [refreshing, setRefreshing] = useState(false);
  return (
    <Box>
      <Text>Address: {address}</Text>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Text>
          Balance: {balance ?? '0'} {DENOM_DISPLAY}
        </Text>
        <IconButton
          aria-label="Refresh balance"
          size="sm"
          onClick={() => {
            if (refreshing) return;
            setRefreshing(true);
            setTimeout(() => {
              setRefreshing(false);
            }, 10000);
            onRefresh()
          }}
          icon='restart'
          attributes={{ marginLeft: '$4' }}
        />
      </div>
    </Box>
  );
};

export default WalletDetails;