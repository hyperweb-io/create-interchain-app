import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyADR36Amino } from '@keplr-wallet/cosmos';
import { decode } from 'bech32';

type RequestBody = {
  message: string;
  signature: string;
  publicKey: string;
  signer: string;
  prefix?: string;
}

type ResponseData = {
  success: boolean;
  message: string;
}

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