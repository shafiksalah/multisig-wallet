import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { Card, CardContent } from "./components/ui/card";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";

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

  useEffect(() => {
    if (window.ethereum) {
      const web3Provider = new ethers.BrowserProvider(window.ethereum);
      setProvider(web3Provider);
    }
  }, []);

  const connectWallet = async () => {
    if (!provider) return;
    const web3Signer = await provider.getSigner();
    setSigner(web3Signer);
    const walletContract = new ethers.Contract(contractAddress, abi, web3Signer);
    setContract(walletContract);
    fetchOwners(walletContract);
  };

  const fetchOwners = async (walletContract) => {
    if (walletContract) {
      const currentOwners = await walletContract.getOwners();
      setOwners(currentOwners);
    }
  };

  const submitTransaction = async () => {
    if (contract) {
      await contract.submitTransaction(txAddress, ethers.parseEther(txAmount));
      alert("Transaction submitted");
    }
  };

  const confirmTransaction = async () => {
    if (contract) {
      await contract.confirmTransaction(txIndex);
      alert("Transaction confirmed");
    }
  };

  const addOwner = async () => {
    if (contract) {
      await contract.addOwner(ownerAddress);
      alert("Owner added");
      fetchOwners(contract);
    }
  };

  const removeOwner = async () => {
    if (contract) {
      await contract.removeOwner(ownerAddress);
      alert("Owner removed");
      fetchOwners(contract);
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen flex flex-col items-center">
      <h1 className="text-2xl font-bold text-blue-600 mb-4">MultiSig Wallet</h1>
      <Button onClick={connectWallet} className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded">Connect Wallet</Button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 w-full max-w-2xl">
        <Card className="shadow-lg p-4 bg-white rounded-lg">
          <CardContent>
            <h2 className="text-lg font-bold text-gray-700">Submit Transaction</h2>
            <Input placeholder="Recipient Address" value={txAddress} onChange={(e) => setTxAddress(e.target.value)} className="mt-2" />
            <Input placeholder="Amount in ETH" value={txAmount} onChange={(e) => setTxAmount(e.target.value)} className="mt-2" />
            <Button onClick={submitTransaction} className="mt-4 bg-green-500 hover:bg-green-600 text-white w-full">Submit</Button>
          </CardContent>
        </Card>

        <Card className="shadow-lg p-4 bg-white rounded-lg">
          <CardContent>
            <h2 className="text-lg font-bold text-gray-700">Confirm Transaction</h2>
            <Input placeholder="Transaction Index" value={txIndex} onChange={(e) => setTxIndex(e.target.value)} className="mt-2" />
            <Button onClick={confirmTransaction} className="mt-4 bg-yellow-500 hover:bg-yellow-600 text-white w-full">Confirm</Button>
          </CardContent>
        </Card>

        <Card className="shadow-lg p-4 bg-white rounded-lg">
          <CardContent>
            <h2 className="text-lg font-bold text-gray-700">Manage Owners</h2>
            <Input placeholder="Owner Address" value={ownerAddress} onChange={(e) => setOwnerAddress(e.target.value)} className="mt-2" />
            <div className="flex gap-2 mt-4">
              <Button onClick={addOwner} className="bg-green-500 hover:bg-green-600 text-white flex-1">Add Owner</Button>
              <Button onClick={removeOwner} className="bg-red-500 hover:bg-red-600 text-white flex-1">Remove Owner</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg p-4 bg-white rounded-lg col-span-1 md:col-span-2">
          <CardContent>
            <h2 className="text-lg font-bold text-gray-700">Current Owners</h2>
            <ul className="mt-2 space-y-1">
              {owners.map((owner, index) => (
                <li key={index} className="text-sm text-gray-700 bg-gray-200 p-2 rounded">{owner}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
