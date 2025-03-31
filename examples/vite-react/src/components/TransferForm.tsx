import { Text, Button, Stack, Box } from '@interchain-ui/react';
import { DENOM_DISPLAY } from '../utils/constants';
import { TransferFormData } from '../utils/validation';

interface TransferFormProps {
  register: ReturnType<any>;
  errors: any;
  handleSubmit: (fn: (data: TransferFormData) => void) => (e?: React.BaseSyntheticEvent) => Promise<void>;
  onSubmit: (data: TransferFormData) => void;
  isLoading: boolean;
}

const TransferForm = ({ register, errors, handleSubmit, onSubmit, isLoading }: TransferFormProps) => {
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack space='$4' direction='vertical'>
        <Box>
          <Text>Recipient Address</Text>
          <input {...register('recipient')} style={{ padding: '10px', width: '100%' }} />
          {errors.recipient && <Text color='$red500'>{errors.recipient.message}</Text>}
        </Box>
        <Box>
          <Text>Amount ({DENOM_DISPLAY})</Text>
          <input {...register('amount')} type="number" step="0.000001" style={{ padding: '10px', width: '100%' }} />
          {errors.amount && <Text color='$red500'>{errors.amount.message}</Text>}
        </Box>
        <Button
          isLoading={isLoading}
          fluidWidth
        >
          Transfer
        </Button>
      </Stack>
    </form>
  );
};

export default TransferForm;