import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { Card, CardContent } from "./components/ui/card";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";

const contractAddress = 0x2fE66F9A7c608096691fA82F3791EDa495471eE3;
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
      <Button onClick={connectWallet} className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-700">Connect Wallet</Button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 w-full max-w-3xl">
        <Card className="p-4 bg-white shadow-lg rounded-xl">
          <CardContent>
            <h2 className="text-xl font-bold text-blue-700">Submit Transaction</h2>
            <Input className="mt-2 border-gray-300" placeholder="Recipient Address" value={txAddress} onChange={(e) => setTxAddress(e.target.value)} />
            <Input className="mt-2 border-gray-300" placeholder="Amount in ETH" value={txAmount} onChange={(e) => setTxAmount(e.target.value)} />
            <Button onClick={submitTransaction} className="mt-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-green-700">Submit</Button>
          </CardContent>
        </Card>

        <Card className="p-4 bg-white shadow-lg rounded-xl">
          <CardContent>
            <h2 className="text-xl font-bold text-purple-700">Confirm Transaction</h2>
            <Input className="mt-2 border-gray-300" placeholder="Transaction Index" value={txIndex} onChange={(e) => setTxIndex(e.target.value)} />
            <Button onClick={confirmTransaction} className="mt-4 bg-purple-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-purple-700">Confirm</Button>
          </CardContent>
        </Card>

        <Card className="p-4 bg-white shadow-lg rounded-xl">
          <CardContent>
            <h2 className="text-xl font-bold text-red-700">Manage Owners</h2>
            <Input className="mt-2 border-gray-300" placeholder="Owner Address" value={ownerAddress} onChange={(e) => setOwnerAddress(e.target.value)} />
            <div className="flex gap-4 mt-4">
              <Button onClick={addOwner} className="bg-green-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-green-700">Add Owner</Button>
              <Button onClick={removeOwner} className="bg-red-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-red-700">Remove Owner</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="p-4 bg-white shadow-lg rounded-xl">
          <CardContent>
            <h2 className="text-xl font-bold text-gray-700">Current Owners</h2>
            <ul className="mt-2">
              {owners.map((owner, index) => (
                <li key={index} className="text-sm text-gray-700 border-b py-1">{owner}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
