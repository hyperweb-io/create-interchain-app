import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyADR36Amino } from '@keplr-wallet/cosmos';
import { decode } from 'bech32';

type RequestBody = {
  message: string;
  signature: string;
  publicKey: string;
  signer: string;
}

type ResponseData = {
  success: boolean;
  message: string;
}


const SIGNATURE_EXPIRY_MS = 5 * 60 * 1000;

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({
      success: false,
      message: `Method ${req.method} Not Allowed`
    });
  }

  const { message, signature, publicKey, signer } = req.body as RequestBody;

  if (!message || !signature || !publicKey || !signer) {
    return res.status(400).json({
      success: false,
      message: 'Missing required parameters: message, signature, publicKey, signer',
    });
  }

  try {
    const messageTimestamp = extractTimestampFromMessage(message);

    if (messageTimestamp) {
      const timestampDate = new Date(messageTimestamp);
      const currentTime = new Date();

      if (isNaN(timestampDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: 'Invalid timestamp format in message'
        });
      }

      if (currentTime.getTime() - timestampDate.getTime() > SIGNATURE_EXPIRY_MS) {
        return res.status(401).json({
          success: false,
          message: 'Authentication expired. Please sign in again.'
        });
      }
    } else {
      console.warn('No timestamp found in message, skipping timestamp validation');
    }

    // Convert base64 public key to Uint8Array
    const pubKeyBytes = new Uint8Array(Buffer.from(publicKey, 'base64'));
    // Convert base64 signature to Uint8Array
    const signatureBytes = new Uint8Array(Buffer.from(signature, 'base64'));

    const isValid = verifyADR36Amino(
      decode(signer).prefix,
      signer,
      message,
      pubKeyBytes,
      signatureBytes
    );

    if (isValid) {
      return res.status(200).json({
        success: true,
        message: 'Signature verification successful!'
      });
    } else {
      return res.status(400).json({
        success: false,
        message: 'Signature verification failed!'
      });
    }
  } catch (error: any) {
    console.error('Error verifying signature:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error: ' + error.message
    });
  }
}


function extractTimestampFromMessage(message: string): string | null {
  // "Please sign this message to complete login authentication.\nTimestamp: 2023-04-30T12:34:56.789Z\nNonce: abc123"
  const timestampMatch = message.match(/Timestamp:\s*([^\n]+)/);
  return timestampMatch ? timestampMatch[1].trim() : null;
}