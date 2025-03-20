import { FormControl, FormLabel, Input, Text, VStack, Button } from '@chakra-ui/react';
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
      <VStack spacing={4}>
        <FormControl isInvalid={!!errors.recipient}>
          <FormLabel>Recipient Address</FormLabel>
          <Input {...register('recipient')} />
          {errors.recipient && <Text color="red.500">{errors.recipient.message}</Text>}
        </FormControl>
        <FormControl isInvalid={!!errors.amount}>
          <FormLabel>Amount ({DENOM_DISPLAY})</FormLabel>
          <Input {...register('amount')} type="number" step="0.000001" />
          {errors.amount && <Text color="red.500">{errors.amount.message}</Text>}
        </FormControl>
        <Button type="submit" colorScheme="blue" isLoading={isLoading} width="100%">
          Transfer
        </Button>
      </VStack>
    </form>
  );
};

export default TransferForm;