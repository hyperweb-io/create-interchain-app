import { Box, Text, HStack, IconButton } from '@chakra-ui/react';
import { RepeatIcon } from '@chakra-ui/icons';
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
      <HStack>
        <Text>
          Balance: {balance ?? '0'} {DENOM_DISPLAY}
        </Text>
        <IconButton
          aria-label="Refresh balance"
          icon={<RepeatIcon />}
          size="sm"
          onClick={onRefresh}
        />
      </HStack>
    </Box>
  );
};

export default WalletDetails;