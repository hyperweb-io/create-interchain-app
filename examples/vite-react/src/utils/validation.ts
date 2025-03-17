import { z } from 'zod';

export const transferFormSchema = z.object({
  recipient: z.string().regex(/^cosmos[0-9a-z]{39}$/, 'Invalid Cosmos address'),
  amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: 'Amount must be a positive number',
  }),
});

export type TransferFormData = z.infer<typeof transferFormSchema>;