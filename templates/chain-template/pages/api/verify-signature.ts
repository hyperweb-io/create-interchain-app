import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyADR36Amino } from '@keplr-wallet/cosmos';
import { decode } from 'bech32';
import { createHash } from 'crypto';

type RequestBody = {
  message: string;
  signature: string;
  publicKey: string;
  signer: string;
  chainType?: string;
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

  const { message, signature, publicKey, signer, chainType } = req.body as RequestBody;

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

    let isValid: boolean;

    if (chainType === 'eip155') {
      // Verify Ethereum personal_sign signature
      isValid = verifyEthereumSignature(message, signature, signer);
    } else {
      // Verify Cosmos signature (default behavior)
      // Convert base64 public key to Uint8Array
      const pubKeyBytes = new Uint8Array(Buffer.from(publicKey, 'base64'));
      // Convert base64 signature to Uint8Array
      const signatureBytes = new Uint8Array(Buffer.from(signature, 'base64'));

      isValid = verifyADR36Amino(
        decode(signer).prefix,
        signer,
        message,
        pubKeyBytes,
        signatureBytes
      );
    }

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

function verifyEthereumSignature(message: string, signature: string, expectedAddress: string): boolean {
  try {
    const secp256k1 = require('secp256k1');
    const keccak = require('keccak');

    console.log('Verifying Ethereum signature:');
    console.log('Message:', JSON.stringify(message));
    console.log('Signature:', signature);
    console.log('Expected address:', expectedAddress);

    // Try different message formats that MetaMask might use
    const messageFormats = [
      message, // Original message
      message.replace(/\\n/g, '\n'), // Replace escaped newlines
      Buffer.from(message, 'utf8').toString(), // Ensure UTF-8 encoding
    ];

    for (let i = 0; i < messageFormats.length; i++) {
      const testMessage = messageFormats[i];
      console.log(`\nTrying message format ${i + 1}:`, JSON.stringify(testMessage));
      
      // Ethereum personal sign message format
      const prefix = '\x19Ethereum Signed Message:\n';
      const messageBuffer = Buffer.from(testMessage, 'utf8');
      const prefixedMessage = prefix + messageBuffer.length + testMessage;
      
      console.log('Prefixed message:', JSON.stringify(prefixedMessage));
      console.log('Message buffer length:', messageBuffer.length);
      
      // Hash the prefixed message
      const messageHash = keccak('keccak256').update(Buffer.from(prefixedMessage, 'utf8')).digest();
      console.log('Message hash:', messageHash.toString('hex'));
      
      // Remove 0x prefix if present and convert to buffer
      const sigHex = signature.startsWith('0x') ? signature.slice(2) : signature;
      const sigBuffer = Buffer.from(sigHex, 'hex');
      
      if (sigBuffer.length !== 65) {
        continue;
      }
      
      // Extract r, s, v from signature
      const r = sigBuffer.slice(0, 32);
      const s = sigBuffer.slice(32, 64);
      let v = sigBuffer[64];
      
      console.log('Original v:', v);
      
      // Try both recovery IDs
      for (const recoveryId of [0, 1]) {
        try {
          console.log(`Trying recovery ID: ${recoveryId}`);
          
          // Combine r and s for secp256k1
          const signature65 = new Uint8Array([...r, ...s]);
          
          // Recover public key
          const publicKey = secp256k1.ecdsaRecover(signature65, recoveryId, new Uint8Array(messageHash));
          
          // Convert public key to address
          const publicKeyBuffer = Buffer.from(publicKey.slice(1));
          const publicKeyHash = keccak('keccak256').update(publicKeyBuffer).digest();
          const address = '0x' + publicKeyHash.slice(-20).toString('hex');
          
          console.log(`Recovered address: ${address}`);
          
          // Compare with expected address (case insensitive)
          if (address.toLowerCase() === expectedAddress.toLowerCase()) {
            console.log('✅ Signature verification successful!');
            return true;
          }
        } catch (e) {
          console.log(`❌ Failed with recovery ID ${recoveryId}:`, e);
        }
      }
    }
    
    console.log('❌ All message formats and recovery IDs failed');
    return false;
    
  } catch (error) {
    console.error('Error verifying Ethereum signature:', error);
    return false;
  }
}

function extractTimestampFromMessage(message: string): string | null {
  // "Please sign this message to complete login authentication.\nTimestamp: 2023-04-30T12:34:56.789Z\nNonce: abc123"
  const timestampMatch = message.match(/Timestamp:\s*([^\n]+)/);
  return timestampMatch ? timestampMatch[1].trim() : null;
}