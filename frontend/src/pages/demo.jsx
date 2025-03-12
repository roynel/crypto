import { useState } from "react";
import { ethers } from "ethers";
import VulnerableNFTABI from "../../abis/VulnerableNFT.json"; 
import NFTDrainerABI from "../../abis/NFTDrainer.json"; 
import DeployersADD from "../../abis/DeployersADD.json";

const NFT_CONTRACT_ADDRESS = DeployersADD.nftAddress;
const DRAINER_CONTRACT_ADDRESS = DeployersADD.drainerAddress;

export function Demo() {
  const [account, setAccount] = useState(null);
  const [nftId, setNftId] = useState(null);
  const [isApproved, setIsApproved] = useState(false);

  // Connect wallet
  const connectWallet = async () => {
    if (window.ethereum) {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      setAccount(accounts[0]);
    } else {
      alert("Install MetaMask!");
    }
  };

  // Mint NFT
  const mintNFT = async () => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const nftContract = new ethers.Contract(NFT_CONTRACT_ADDRESS, VulnerableNFTABI.abi, signer);
      
      const tx = await nftContract.mint(account, { gasLimit: 200000 });
      const receipt = await tx.wait();

      let tokenId;
      const transferEvent = receipt.logs
        .map((log) => {
          try {
            return nftContract.interface.parseLog(log);
          } catch (e) {
            return null;
          }
        })
        .find((event) => event && event.name === "Transfer");

      if (transferEvent) {
        tokenId = transferEvent.args.tokenId;
      } else {
        tokenId = tx.value;
        if (!tokenId) throw new Error("No tokenId found");
      }

      setNftId(tokenId.toString());
    } catch (error) {
      console.error("Mint error:", error);
      alert("Mint failed: " + error.message);
    }
  };

  // Approve Drainer
  const approveDrainer = async () => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const nftContract = new ethers.Contract(NFT_CONTRACT_ADDRESS, VulnerableNFTABI.abi, signer);
      await nftContract.approve(DRAINER_CONTRACT_ADDRESS, nftId, { gasLimit: 200000 });
      setIsApproved(true);
      alert("NFT Approved! Now the attacker can drain it.");
    } catch (error) {
      console.error("Approve error:", error);
      alert("Approve failed: " + error.message);
    }
  };

  // Drain NFT
  const drainNFT = async () => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const drainerContract = new ethers.Contract(DRAINER_CONTRACT_ADDRESS, NFTDrainerABI.abi, signer);
      
      const tx = await drainerContract.drainNFT(NFT_CONTRACT_ADDRESS, nftId, { gasLimit: 200000 });
      await tx.wait();
      
      alert(`NFT ${nftId} drained successfully! It’s now owned by the attacker.`);
      // setNftId(null); // Reset state
      // setIsApproved(false);
    } catch (error) {
      console.error("Drain error:", error);
      if (error.code === "CALL_EXCEPTION") {
        alert("Drain failed: Transaction reverted. Check if NFT was already drained or approval was revoked.");
      } else {
        alert("Drain failed: " + error.message);
      }
    }
  };

  // Check NFT Owner (optional verification)
  const checkOwner = async () => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const nftContract = new ethers.Contract(NFT_CONTRACT_ADDRESS, VulnerableNFTABI.abi, provider);
      const owner = await nftContract.ownerOf(nftId);
      alert(`Current owner of NFT ${nftId}: ${owner}`);
    } catch (error) {
      console.error("Check owner error:", error);
      alert("Failed to check owner: " + error.message);
    }
  };

  return (
    <div className="flex h-screen w-screen justify-center items-center">
      <div className="p-12 bg-gray-100 border border-gray-200 rounded-xl ">
        <div className="p-4"><h1>NFT Drainer Demo</h1></div>
        {!account ? (
          <button className="p-4 bg-blue-300 rounded-2xl border border-gray-200 cursor-pointer" onClick={connectWallet}>Connect Wallet</button>
        ) : (
          <div className="p-6 flex flex-col justify-center items-center">
            <p>Connected: {account}</p>
            {!nftId ? (
              <button className="p-6 border border-gray-200 bg-purple-100 rounded-2xl mt-2 cursor-pointer" onClick={mintNFT}>Mint NFT</button>
            ) : (
              <>
                <p>Minted NFT ID: {nftId}</p>
                {!isApproved ? (
                  <button className="p-6 border border-gray-200 bg-yellow-100 rounded-2xl mt-2 cursor-pointer" onClick={approveDrainer}>
                    Approve (Simulate Malicious Action)
                  </button>
                ) : (
                  <>
                    <button className="p-6 border border-gray-200 bg-red-100 rounded-2xl mt-2 cursor-pointer" onClick={drainNFT}>
                      Drain NFT (Attacker Action)
                    </button>
                    <button className="p-6 border border-gray-200 bg-green-100 rounded-2xl mt-2 cursor-pointer" onClick={checkOwner}>
                      Check Owner
                    </button>
                  </>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

