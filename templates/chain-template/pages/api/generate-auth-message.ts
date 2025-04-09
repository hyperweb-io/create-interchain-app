import type { NextApiRequest, NextApiResponse } from 'next';
import { randomBytes } from 'crypto';

type ResponseData = {
  message: string;
  timestamp: string;
  nonce: string;
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData | { error: string }>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Generate current timestamp in ISO format
    const timestamp = new Date().toISOString();

    // Generate random nonce
    const nonce = randomBytes(8).toString('hex');

    // Format the authentication message with explicit line breaks
    const message = `Please sign this message to complete login authentication.\nTimestamp: ${timestamp}\nNonce: ${nonce}`;

    return res.status(200).json({
      message,
      timestamp,
      nonce
    });
  } catch (error) {
    console.error('Error generating auth message:', error);
    return res.status(500).json({ error: 'Failed to generate authentication message' });
  }
}