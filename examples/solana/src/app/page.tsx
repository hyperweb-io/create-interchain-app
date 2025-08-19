'use client';

import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import {
  PhantomSigningClient,
  PublicKey,
  DEVNET_ENDPOINT,
  lamportsToSol,
  solToLamports,
  isPhantomInstalled
} from '@interchainjs/solana';
import { useChain, useWalletManager } from '@interchain-kit/react';

type StatusContent = ReactNode;

export default function Home() {
  const [client, setClient] = useState<PhantomSigningClient | null>(null);
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [recipient, setRecipient] = useState<string>('');
  const [amount, setAmount] = useState<string>('0.001');
  const [status, setStatus] = useState<StatusContent>('');
  const [isPhantomAvailable, setIsPhantomAvailable] = useState<boolean>(false);

  const { wallet, chain, connect } = useChain('solana')
  console.log('chain', chain)
  console.log('wallet', wallet)
  // const provider = wallet.getProvider(chain.chainId)
  // console.log('provider', provider)

  // const { wallets } = useWalletManager();
  // console.log('wallets', wallets)

  useEffect(() => {


    // Check if Phantom is installed
    setIsPhantomAvailable(isPhantomInstalled());
    if (!isPhantomInstalled()) {
      setStatus('Phantom wallet not found. Please install Phantom wallet extension.');
    } else {
      setStatus('Ready to connect to Phantom wallet');
    }
  }, []);

  const connectWallet = async () => {
    connect()
    console.log('wallet 2', wallet)
    if (!isPhantomAvailable) {
      setStatus('Please install Phantom wallet extension first.');
      return;
    }

    try {
      setLoading(true);
      setStatus('Connecting to Phantom wallet...');

      const newClient = await PhantomSigningClient.connectWithPhantom(
        DEVNET_ENDPOINT,
        {
          commitment: 'confirmed',
          broadcast: { checkTx: true, timeout: 60000 }
        }
      );

      setClient(newClient); // original
      // console.log('wallet 2', wallet)
      // const provider = await wallet.getProvider()
      // console.log('provider', provider)
      // setClient(provider)
      const walletAddress = newClient.signerAddress.toString();
      setWalletAddress(walletAddress);
      setRecipient(walletAddress);
      setStatus('Connected to Phantom wallet!');

      // Get initial balance
      await updateBalance(newClient);
    } catch (error) {
      setStatus(`Error connecting wallet: ${(error as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  const disconnectWallet = async () => {
    if (!client) return;

    try {
      setLoading(true);
      setStatus('Disconnecting from wallet...');

      await client.disconnect();
      setClient(null);
      setWalletAddress('');
      setBalance(0);
      setStatus('Disconnected from wallet');
    } catch (error) {
      setStatus(`Error disconnecting wallet: ${(error as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  const updateBalance = async (clientToUse?: PhantomSigningClient) => {
    if (!clientToUse && !client) return;

    try {
      setLoading(true);
      const currentBalance = await (clientToUse || client)!.getBalance();
      setBalance(currentBalance);
      setStatus(`Balance updated: ${lamportsToSol(currentBalance)} SOL`);
    } catch (error) {
      setStatus(`Error getting balance: ${(error as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  const requestAirdrop = async () => {
    if (!client) return;

    try {
      setLoading(true);
      setStatus('Requesting airdrop...');

      const signature = await client.requestAirdrop(solToLamports(0.5));
      setStatus(
        <span>
          Airdrop requested!{' '}
          <a
            href={`https://explorer.solana.com/tx/${signature}?cluster=devnet`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline text-blue-600 hover:text-blue-800"
          >
            View on Devnet Explorer
          </a>
        </span>
      );

      // Wait a bit for the airdrop to process
      setTimeout(() => {
        updateBalance();
      }, 5000);
    } catch (error) {
      setStatus(`Airdrop error: ${(error as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  const sendTransaction = async () => {
    if (!client || !recipient || !amount) {
      setStatus('Please fill in recipient and amount');
      return;
    }

    try {
      setLoading(true);
      setStatus('Preparing transaction...');

      const recipientPublicKey = new PublicKey(recipient);
      const lamportsAmount = solToLamports(parseFloat(amount));

      setStatus('Please approve the transaction in Phantom wallet...');

      console.log('Sending transfer:', {
        recipient: recipientPublicKey.toString(),
        amount: lamportsAmount,
        fromAddress: client.signerAddress.toString()
      });

      const signature = await client.transfer({
        recipient: recipientPublicKey,
        amount: lamportsAmount,
      });

      console.log('Transfer successful:', signature);
      setStatus(
        <span>
          Transaction confirmed!{' '}
          <a
            href={`https://explorer.solana.com/tx/${signature}?cluster=devnet`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline text-blue-600 hover:text-blue-800"
          >
            View on Devnet Explorer
          </a>
        </span>
      );

      // Update balance after transaction
      setTimeout(() => {
        updateBalance();
      }, 3000);

      // Clear form
      setRecipient('');
      setAmount('');
    } catch (error) {
      setStatus(`Transaction error: ${(error as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setStatus('Copied to clipboard!');
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            @interchainjs/solana Test Page
          </h1>
        </div>

        {/* Phantom Status */}
        <div className="mb-6">
          <div className="bg-gray-50 p-3 rounded">
            <p className="text-sm font-medium text-gray-600">Phantom Wallet Status:</p>
            <p className={`text-sm ${isPhantomAvailable ? 'text-green-600' : 'text-red-600'}`}>
              {isPhantomAvailable ? '✅ Phantom wallet detected' : '❌ Phantom wallet not found'}
            </p>
          </div>
        </div>

        {/* Connection Section */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-3">Wallet Connection</h2>
          {!client ? (
            <button
              onClick={connectWallet}
              className="w-full bg-purple-500 text-white py-2 px-4 rounded hover:bg-purple-600 transition-colors disabled:opacity-50"
              disabled={loading || !isPhantomAvailable}
            >
              {loading ? 'Connecting...' : 'Connect Phantom Wallet'}
            </button>
          ) : (
            <div className="space-y-3">
              <div className="bg-green-50 p-3 rounded border border-green-200">
                <p className="text-sm font-medium text-green-600">✅ Wallet Connected</p>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-xs text-green-800 font-mono break-all">
                    {walletAddress}
                  </p>
                  <button
                    onClick={() => copyToClipboard(walletAddress)}
                    className="text-green-600 hover:text-green-800 text-xs"
                  >
                    Copy
                  </button>
                </div>
              </div>

              <div className="bg-gray-50 p-3 rounded">
                <p className="text-sm font-medium text-gray-600">Balance:</p>
                <div className="flex items-center gap-2">
                  <p className="text-lg font-bold text-gray-800">
                    {lamportsToSol(balance)} SOL
                  </p>
                  <button
                    onClick={() => updateBalance()}
                    className="text-blue-500 hover:text-blue-700 text-xs"
                    disabled={loading}
                  >
                    Refresh
                  </button>
                </div>
              </div>

              <button
                onClick={disconnectWallet}
                className="w-full bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600 transition-colors"
                disabled={loading}
              >
                Disconnect Wallet
              </button>
            </div>
          )}
        </div>

        {/* Airdrop Section */}
        {client && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-3">Airdrop</h2>
            <button
              onClick={requestAirdrop}
              className="w-full bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 transition-colors"
              disabled={loading}
            >
              Request 0.5 SOL Airdrop
            </button>
          </div>
        )}

        {/* Transfer Section */}
        {client && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-3">Send SOL</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Recipient Address:
                </label>
                <input
                  type="text"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter recipient's public key"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Amount (SOL):
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="0.001"
                  step="0.001"
                  min="0"
                />
              </div>

              <button
                onClick={sendTransaction}
                className="w-full bg-orange-500 text-white py-2 px-4 rounded hover:bg-orange-600 transition-colors"
                disabled={loading || !recipient || !amount}
              >
                {loading ? 'Processing...' : 'Send Transaction'}
              </button>
            </div>
          </div>
        )}

        {/* Status Section */}
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-700 mb-3">Status</h2>
          <div className="bg-gray-50 p-3 rounded min-h-[60px]">
            <p className="text-sm text-gray-700">
              {loading ? 'Loading...' : status || 'Ready to use'}
            </p>
          </div>
        </div>

        {/* Info Section */}
        <div className="text-center text-xs text-gray-500">
          <p>Connected to Solana Devnet</p>
          <p>Built with @interchainjs/solana</p>
          <p>Powered by Hyperweb</p>
        </div>
      </div>
    </div>
  );
}