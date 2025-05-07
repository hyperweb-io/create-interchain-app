"use client"

import { Box, Button, TextField, NumberField, FieldLabel, Callout } from "@interchain-ui/react"
import React, { useState, useEffect } from "react"
import { Wallet, ArrowRight, RefreshCw, AlertCircle } from "lucide-react"
import { SignerFromBrowser } from "@interchainjs/ethereum/signers/SignerFromBrowser"
import { MetaMaskInpageProvider } from "@metamask/providers";
import BigNumber from "bignumber.js";
import { useChain } from '@interchain-kit/react'
import { WalletState } from "@interchain-kit/core"
import { BSC_TESTNET, HOLESKY_TESTNET, SEPOLIA_TESTNET } from "./provider"

type EthereumProvider = MetaMaskInpageProvider

// Alias Card components
const Card = Box
const CardHeader = Box
const CardContent = Box
const CardFooter = Box
const CardTitle = Box
const CardDescription = Box

export default function WalletPage() {
  const [balance, setBalance] = useState<string>("0")
  const [isLoading, setIsLoading] = useState(false)
  const [recipient, setRecipient] = useState("")
  const [amount, setAmount] = useState<number>(0)
  const [error, setError] = useState("")
  const [ethereum, setEthereum] = useState<EthereumProvider>()

  const { wallet, status, connect, address: account, disconnect } = useChain(SEPOLIA_TESTNET.chainName) // chain name must be same as getProvider chain id

  useEffect(() => {
    console.log('status from useChain:', status)
    if (status === WalletState.Connected) {
      const setEthProviderFromWallet = async () => {
        await new Promise(resolve => setTimeout(resolve, 500))
        const ethProviderFromWallet = await wallet.getProvider(SEPOLIA_TESTNET.chainId) as EthereumProvider
        console.log("Ethereum provider:", ethProviderFromWallet)
        setEthereum(ethProviderFromWallet)
      }
      setEthProviderFromWallet()
    }
    setIsLoading(status === WalletState.Connecting)
  }, [status])

  // Connect wallet
  const connectWallet = async () => {
    connect()
  }

  // Disconnect wallet
  const disconnectWallet = () => {
    disconnect()
    setBalance("0")
    setError("")
  }

  // Get balance
  const getBalance = async () => {
    if (!ethereum) return
    try {
      console.log('ethereum in getBalance:', ethereum)
      const wallet = new SignerFromBrowser(
        ethereum!
        // window.ethereum as EthereumProvider
      )
      console.log('wallet in getBalance:', wallet)
      const balance = await wallet.getBalance()
      console.log('balance in getBalance:', balance)
      setBalance(new BigNumber(balance.toString()).div(10 ** 18).toString())
    } catch (err: any) {
      console.error("Failed to get balance:", err)
      setError(err.message || "Failed to get balance")
    }
  }

  // Refresh balance
  const refreshBalance = async () => {
    console.log('account in refreshBalance:', account)
    if (account) {
      await getBalance()
    }
  }

  // Send transaction
  const sendTransaction = async () => {
    setIsLoading(true)
    setError("")

    try {
      if (!recipient || amount <= 0) {
        throw new Error("Please enter recipient address and amount")
      }

      if (!/^0x[a-fA-F0-9]{40}$/.test(recipient)) {
        throw new Error("Invalid Ethereum address")
      }

      const signer = new SignerFromBrowser(ethereum!)

      // Create transaction
      const tx = {
        to: recipient,
        value: BigInt(new BigNumber(amount).shiftedBy(18).integerValue(BigNumber.ROUND_DOWN).toString())
      }

      // Send transaction
      const transaction = await signer.send(tx)

      // Wait for confirmation
      await transaction.wait()

      // Update balance
      await getBalance()

      // Clear form
      setRecipient("")
      setAmount(0)
    } catch (err: any) {
      setError(err.message || "Transaction failed")
    } finally {
      setIsLoading(false)
    }
  }

  // Listen for account changes
  useEffect(() => {
    if (account) {
      getBalance()
      return
    }
    setBalance("0")
  }, [account, ethereum])

  return (
    <main className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold text-center mb-8">Ethereum Wallet</h1>

      <Box className={`grid gap-6 ${status === WalletState.Connected ? "md:grid-cols-2" : ""}`}>
        <Card className='border border-1 p-5 rounded-md'>
          <CardHeader className='mb-4'>
            <CardTitle className='font-bold text-2xl'>Wallet Connection</CardTitle>
            <CardDescription className='text-gray-500'>Connect your Ethereum wallet to view balance</CardDescription>
          </CardHeader>
          <CardContent>
            {status !== WalletState.Connected ? (
              <Button onClick={connectWallet} disabled={isLoading} className="w-full">
                {isLoading ? "Connecting..." : "Connect Wallet"}
                <Wallet className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Box className="space-y-4">
                <Box className="flex flex-col space-y-1">
                  <FieldLabel htmlFor="account" label='Wallet Address'>Wallet Address</FieldLabel>
                  <Box id="account" className="p-2 border rounded-md bg-muted font-mono text-sm break-all">{account}</Box>
                </Box>

                <Box className="flex flex-col space-y-1">
                  <Box className="flex items-center">
                    <Box className="flex-1">
                      <FieldLabel htmlFor="balance" label="ETH Balance">ETH Balance</FieldLabel>
                    </Box>
                    <Button size="sm" className="mr-2">
                      <a href="https://cloud.google.com/application/web3/faucet/ethereum/sepolia"
                        target="_blank"
                      >Faucet</a>
                    </Button>
                    <Button onClick={refreshBalance} disabled={isLoading} size="sm">
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </Box>
                  <Box id="balance" className="p-2 border rounded-md bg-muted font-mono text-xl">{balance} ETH</Box>
                </Box>

                <Button onClick={disconnectWallet} className="w-full">
                  Disconnect Wallet
                </Button>
              </Box>
            )}
          </CardContent>
        </Card>

        {status === WalletState.Connected && (
          <Card className='border border-1 p-5 rounded-md'>
            <CardHeader className='mb-4'>
              <CardTitle className='font-bold text-2xl'>Send Ethereum</CardTitle>
              <CardDescription className='text-gray-500'>Transfer ETH to another address</CardDescription>
            </CardHeader>
            <CardContent>
              <Box className="space-y-4">
                <Box className="space-y-2">
                  <FieldLabel htmlFor="recipient" label="Recipient Address">Recipient Address</FieldLabel>
                  <TextField
                    id="recipient"
                    placeholder="0x..."
                    value={recipient}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRecipient(e.target.value)}
                    disabled={isLoading}
                  />
                </Box>

                <Box className="space-y-2">
                  <FieldLabel htmlFor="amount" label='Amount (ETH)'>Amount (ETH)</FieldLabel>
                  <NumberField
                    id="amount"
                    placeholder="0.01"
                    value={amount}
                    onChange={(value: number) => setAmount(value)}
                    isDisabled={isLoading}
                  />
                </Box>
              </Box>
            </CardContent>
            <CardFooter className="mt-4">
              <Button className="w-full" onClick={sendTransaction} disabled={isLoading || !recipient || amount <= 0}>
                {isLoading ? "Processing..." : "Send Transaction"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        )}
      </Box>

      {error && (
        <Callout title="Error" className="mt-6" intent="error">
          <Box as="span" className="h-4 w-4 inline-block mr-2"><AlertCircle /></Box>
          {error}
        </Callout>
      )}
    </main>
  )
}
