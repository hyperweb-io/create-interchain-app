import { Box, Text, Stack, IconButton } from '@interchain-ui/react';
import { DENOM_DISPLAY } from '../utils/constants';

interface WalletDetailsProps {
  address: string;
  balance: number | string;
  onRefresh: () => void;
}

const WalletDetails = ({ address, balance, onRefresh }: WalletDetailsProps) => {
  return (
    <Box>
      <Text>Address: {address}</Text>
      <Stack>
        <Text>
          Balance: {balance ?? '0'} {DENOM_DISPLAY}
        </Text>
        <IconButton
          aria-label="Refresh balance"
          size="sm"
          onClick={onRefresh}
          icon='copy'
        />
      </Stack>
    </Box>
  );
};

export default WalletDetails;