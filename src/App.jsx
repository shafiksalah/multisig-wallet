import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { Card, CardContent } from "./components/ui/card";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { Loader, CheckCircle, XCircle } from "lucide-react";

const contractAddress = "YOUR_CONTRACT_ADDRESS";
const abi = [
  "function submitTransaction(address _to, uint _amount) public",
  "function confirmTransaction(uint _txIndex) public",
  "function addOwner(address newOwner) public",
  "function removeOwner(address ownerToRemove) public",
  "function getOwners() public view returns (address[] memory)",
  "function transactions(uint) public view returns (address to, uint amount, bool executed, uint confirmations)",
];

export default function MultiSigWalletUI() {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [txIndex, setTxIndex] = useState("");
  const [txAddress, setTxAddress] = useState("");
  const [txAmount, setTxAmount] = useState("");
  const [ownerAddress, setOwnerAddress] = useState("");
  const [owners, setOwners] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (window.ethereum) {
      const web3Provider = new ethers.BrowserProvider(window.ethereum);
      setProvider(web3Provider);
    }
  }, []);

  const connectWallet = async () => {
    if (!provider) return;
    setLoading(true);
    try {
      const web3Signer = await provider.getSigner();
      setSigner(web3Signer);
      const walletContract = new ethers.Contract(contractAddress, abi, web3Signer);
      setContract(walletContract);
      fetchOwners(walletContract);
      fetchTransactions(walletContract);
      setMessage({ type: "success", text: "Wallet connected successfully!" });
    } catch (error) {
      setMessage({ type: "error", text: "Failed to connect wallet." });
    }
    setLoading(false);
  };

  const fetchOwners = async (walletContract) => {
    if (walletContract) {
      const currentOwners = await walletContract.getOwners();
      setOwners(currentOwners);
    }
  };

  const fetchTransactions = async (walletContract) => {
    if (walletContract) {
      const txs = [];
      for (let i = 0; i < 10; i++) {
        try {
          const tx = await walletContract.transactions(i);
          txs.push(tx);
        } catch (error) {
          break;
        }
      }
      setTransactions(txs);
    }
  };

  const submitTransaction = async () => {
    if (contract) {
      setLoading(true);
      try {
        await contract.submitTransaction(txAddress, ethers.parseEther(txAmount));
        setMessage({ type: "success", text: "Transaction submitted successfully!" });
      } catch (error) {
        setMessage({ type: "error", text: "Transaction failed." });
      }
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-lg mx-auto space-y-4">
      {message && (
        <div className={`p-2 rounded text-white ${message.type === "success" ? "bg-green-500" : "bg-red-500"}`}>
          {message.type === "success" ? <CheckCircle className="inline mr-2" /> : <XCircle className="inline mr-2" />} 
          {message.text}
        </div>
      )}
      <Button onClick={connectWallet} disabled={loading}>
        {loading ? <Loader className="animate-spin" /> : "Connect Wallet"}
      </Button>

      <Card className="p-4">
        <CardContent>
          <h2 className="text-lg font-bold">Submit Transaction</h2>
          <Input placeholder="Recipient Address" value={txAddress} onChange={(e) => setTxAddress(e.target.value)} />
          <Input placeholder="Amount in ETH" value={txAmount} onChange={(e) => setTxAmount(e.target.value)} />
          <Button onClick={submitTransaction} className="mt-2 bg-blue-500 text-white" disabled={loading}>
            {loading ? <Loader className="animate-spin" /> : "Submit"}
          </Button>
        </CardContent>
      </Card>

      <Card className="p-4">
        <CardContent>
          <h2 className="text-lg font-bold">Current Owners</h2>
          <ul>
            {owners.map((owner, index) => (
              <li key={index} className="text-sm text-gray-700">{owner}</li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card className="p-4">
        <CardContent>
          <h2 className="text-lg font-bold">Recent Transactions</h2>
          <ul>
            {transactions.map((tx, index) => (
              <li key={index} className="text-sm text-gray-700">
                {tx.to} - {ethers.formatEther(tx.amount)} ETH - {tx.executed ? "Executed" : "Pending"}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

