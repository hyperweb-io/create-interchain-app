"use client"

import { useState, useEffect } from "react"
import { ethers } from "ethers"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Wallet, ArrowRight, RefreshCw, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"

export default function WalletPage() {
  const [account, setAccount] = useState<string>("")
  const [balance, setBalance] = useState<string>("0")
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [recipient, setRecipient] = useState("")
  const [amount, setAmount] = useState("")
  const [error, setError] = useState("")
  const { toast } = useToast()

  // Check if MetaMask is installed
  const checkIfWalletIsInstalled = () => {
    return typeof window !== "undefined" && typeof window.ethereum !== "undefined"
  }

  // Connect wallet
  const connectWallet = async () => {
    setIsLoading(true)
    setError("")

    try {
      if (!checkIfWalletIsInstalled()) {
        throw new Error("Please install MetaMask wallet")
      }

      // Request account access
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" })

      if (accounts.length > 0) {
        setAccount(accounts[0])
        setIsConnected(true)
        await getBalance(accounts[0])

        toast({
          title: "Wallet Connected",
          description: `Address: ${accounts[0].substring(0, 6)}...${accounts[0].substring(38)}`,
        })
      }
    } catch (err: any) {
      setError(err.message || "Failed to connect wallet")
      toast({
        title: "Connection Failed",
        description: err.message || "Failed to connect wallet",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Add a disconnectWallet function after the connectWallet function
  const disconnectWallet = () => {
    setAccount("")
    setBalance("0")
    setIsConnected(false)
    setError("")

    toast({
      title: "Wallet Disconnected",
      description: "Your wallet has been disconnected successfully",
    })
  }

  // Get balance
  const getBalance = async (address: string) => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum)
      const balance = await provider.getBalance(address)
      setBalance(ethers.formatEther(balance))
    } catch (err: any) {
      console.error("Failed to get balance:", err)
      setError(err.message || "Failed to get balance")
    }
  }

  // Refresh balance
  const refreshBalance = async () => {
    if (account) {
      await getBalance(account)
      toast({
        title: "Balance Updated",
        description: `Current balance: ${balance} ETH`,
      })
    }
  }

  // Send transaction
  const sendTransaction = async () => {
    setIsLoading(true)
    setError("")

    try {
      if (!recipient || !amount) {
        throw new Error("Please enter recipient address and amount")
      }

      if (!ethers.isAddress(recipient)) {
        throw new Error("Invalid Ethereum address")
      }

      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()

      // Create transaction
      const tx = {
        to: recipient,
        value: ethers.parseEther(amount),
      }

      // Send transaction
      const transaction = await signer.sendTransaction(tx)

      toast({
        title: "Transaction Sent",
        description: `Transaction hash: ${transaction.hash.substring(0, 10)}...`,
      })

      // Wait for confirmation
      await transaction.wait()

      toast({
        title: "Transaction Confirmed",
        description: "Transfer completed successfully",
      })

      // Update balance
      await getBalance(account)

      // Clear form
      setRecipient("")
      setAmount("")
    } catch (err: any) {
      setError(err.message || "Transaction failed")
      toast({
        title: "Transaction Failed",
        description: err.message || "Transaction failed",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Listen for account changes
  useEffect(() => {
    if (checkIfWalletIsInstalled()) {
      window.ethereum.on("accountsChanged", (accounts: string[]) => {
        if (accounts.length > 0) {
          setAccount(accounts[0])
          getBalance(accounts[0])
        } else {
          setAccount("")
          setBalance("0")
          setIsConnected(false)
        }
      })
    }

    return () => {
      if (checkIfWalletIsInstalled()) {
        window.ethereum.removeListener("accountsChanged", () => {})
      }
    }
  }, [])

  return (
    <main className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold text-center mb-8">Ethereum Wallet</h1>

      <div className={`grid gap-6 ${isConnected ? "md:grid-cols-2" : ""}`}>
        <Card>
          <CardHeader>
            <CardTitle>Wallet Connection</CardTitle>
            <CardDescription>Connect your Ethereum wallet to view balance</CardDescription>
          </CardHeader>
          <CardContent>
            {!isConnected ? (
              <Button onClick={connectWallet} disabled={isLoading} className="w-full">
                {isLoading ? "Connecting..." : "Connect Wallet"}
                <Wallet className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <div className="space-y-4">
                <div className="flex flex-col space-y-1">
                  <Label>Wallet Address</Label>
                  <div className="p-2 border rounded-md bg-muted font-mono text-sm break-all">{account}</div>
                </div>

                <div className="flex flex-col space-y-1">
                  <div className="flex justify-between items-center">
                    <Label>ETH Balance</Label>
                    <Button variant="ghost" size="sm" onClick={refreshBalance} disabled={isLoading}>
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="p-2 border rounded-md bg-muted font-mono text-xl">{balance} ETH</div>
                </div>

                <Button variant="destructive" onClick={disconnectWallet} className="w-full">
                  Disconnect Wallet
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {isConnected && (
          <Card>
            <CardHeader>
              <CardTitle>Send Ethereum</CardTitle>
              <CardDescription>Transfer ETH to another address</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="recipient">Recipient Address</Label>
                  <Input
                    id="recipient"
                    placeholder="0x..."
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (ETH)</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.0001"
                    min="0"
                    placeholder="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full" onClick={sendTransaction} disabled={isLoading || !recipient || !amount}>
                {isLoading ? "Processing..." : "Send Transaction"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>

      {error && (
        <Alert variant="destructive" className="mt-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </main>
  )
}
