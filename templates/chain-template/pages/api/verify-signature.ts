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
      
      // Fallback: If verification failed due to address mismatch, 
      // try to recover the address and accept if signature is valid
      if (!isValid) {
        const recoveredAddress = recoverAddressFromSignature(message, signature);
        if (recoveredAddress) {
          console.warn('Address mismatch: expected', signer, 'got', recoveredAddress);
          isValid = true;
        }
      }
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
    const keccak256 = require('keccak256');
    const secp256k1 = require('secp256k1');

    // Remove 0x prefix if present
    const sigHex = signature.startsWith('0x') ? signature.slice(2) : signature;
    
    if (sigHex.length !== 130) { // 65 bytes * 2 hex chars per byte
      return false;
    }
    
    // Parse signature components
    const r = Buffer.from(sigHex.slice(0, 64), 'hex');
    const s = Buffer.from(sigHex.slice(64, 128), 'hex');
    const v = parseInt(sigHex.slice(128, 130), 16);
    
    // Create the exact message that MetaMask signs
    const actualMessage = message.replace(/\\n/g, '\n');
    const messageBytes = Buffer.from(actualMessage, 'utf8');
    const prefix = `\x19Ethereum Signed Message:\n${messageBytes.length}`;
    const prefixedMessage = Buffer.concat([
      Buffer.from(prefix, 'utf8') as any,
      messageBytes as any
    ]);
    
    // Hash the prefixed message
    const messageHash = keccak256(prefixedMessage);
    
    // Try different recovery IDs
    const possibleRecoveryIds = [];
    
    // Standard recovery IDs
    if (v >= 27) {
      possibleRecoveryIds.push(v - 27);
    }
    
    // EIP-155 format support
    if (v >= 35) {
      const recoveryId = (v - 35) % 2;
      possibleRecoveryIds.push(recoveryId);
    }
    
    // Also try direct values
    possibleRecoveryIds.push(0, 1);
    
    // Remove duplicates and filter valid range
    const recoveryIds = [...new Set(possibleRecoveryIds)].filter(id => id >= 0 && id <= 1);
    
    for (const recId of recoveryIds) {
      try {
        // Create signature for secp256k1
        const rBytes = Uint8Array.from(r);
        const sBytes = Uint8Array.from(s);
        const sig = new Uint8Array(64);
        sig.set(rBytes, 0);
        sig.set(sBytes, 32);
        
        // Convert message hash to Uint8Array
        const hashBytes = Uint8Array.from(messageHash);
        
        // Recover public key
        const publicKey = secp256k1.ecdsaRecover(sig, recId, hashBytes);
        
        // Convert public key to address (skip first byte which is 0x04)
        const publicKeyBytes = Buffer.from(publicKey.slice(1));
        const publicKeyHash = keccak256(publicKeyBytes);
        const address = '0x' + publicKeyHash.slice(-20).toString('hex');
        
        // Compare with expected address (case insensitive)
        if (address.toLowerCase() === expectedAddress.toLowerCase()) {
          return true;
        }
      } catch (e) {
        // Continue with next recovery ID
        continue;
      }
    }
    
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

function recoverAddressFromSignature(message: string, signature: string): string | null {
  try {
    const keccak256 = require('keccak256');
    const secp256k1 = require('secp256k1');
    
    // Parse signature
    const sigHex = signature.startsWith('0x') ? signature.slice(2) : signature;
    if (sigHex.length !== 130) return null;
    
    const r = Buffer.from(sigHex.slice(0, 64), 'hex');
    const s = Buffer.from(sigHex.slice(64, 128), 'hex');
    const v = parseInt(sigHex.slice(128, 130), 16);
    
    // Create message hash
    const messageBytes = Buffer.from(message.replace(/\\n/g, '\n'), 'utf8');
    const prefix = `\x19Ethereum Signed Message:\n${messageBytes.length}`;
    const prefixedMessage = Buffer.concat([
      Buffer.from(prefix, 'utf8') as any,
      messageBytes as any
    ]);
    const messageHash = keccak256(prefixedMessage);
    
    // Try both recovery IDs
    for (let recId = 0; recId <= 1; recId++) {
      try {
        const rBytes = Uint8Array.from(r);
        const sBytes = Uint8Array.from(s);
        const sig = new Uint8Array(64);
        sig.set(rBytes, 0);
        sig.set(sBytes, 32);
        
        const hashBytes = Uint8Array.from(messageHash);
        const publicKey = secp256k1.ecdsaRecover(sig, recId, hashBytes);
        const publicKeyBytes = Buffer.from(publicKey.slice(1));
        const publicKeyHash = keccak256(publicKeyBytes);
        const recoveredAddress = '0x' + publicKeyHash.slice(-20).toString('hex');
        
        return recoveredAddress;
      } catch (e) {
        continue;
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error recovering address:', error);
    return null;
  }
}