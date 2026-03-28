import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { ethers } from "ethers";
import axios from "axios";
import VeriWorkJSON from "../VeriWork.json";

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;
const PINATA_API_KEY = import.meta.env.VITE_PINATA_API_KEY;
const PINATA_SECRET = import.meta.env.VITE_PINATA_SECRET_API_KEY;

export const SEPOLIA_CHAIN_ID = "0xaa36a7";
export const SEPOLIA_NETWORK = {
  chainId: SEPOLIA_CHAIN_ID,
  chainName: "Sepolia Testnet",
  nativeCurrency: { name: "SepoliaETH", symbol: "ETH", decimals: 18 },
  rpcUrls: ["https://rpc.sepolia.org"],
  blockExplorerUrls: ["https://sepolia.etherscan.io"],
};

const VeriWorkContext = createContext(null);

export function shortAddr(address = "") {
  if (!address) return "—";
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

export function scoreToneClass(score) {
  if (score >= 200) return "text-success";
  if (score >= 100) return "text-info";
  return "text-warning";
}

export function VeriWorkProvider({ children }) {
  const [account, setAccount] = useState("");
  const [contract, setContract] = useState(null);
  const [toast, setToast] = useState({ msg: "", type: "" });
  const [wrongNetwork, setWrongNetwork] = useState(false);

  const [adminAddress, setAdminAddress] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [busy, setBusy] = useState(false);
  const [adminBusy, setAdminBusy] = useState(false);

  const [workerRecords, setWorkerRecords] = useState([]);
  const [reputation, setReputation] = useState(null);
  const [loadingRec, setLoadingRec] = useState(false);

  const [lookupScore, setLookupScore] = useState(null);
  const [lookupRecords, setLookupRecords] = useState([]);
  const [loadingLookup, setLoadingLookup] = useState(false);

  const [workerAddr, setWorkerAddr] = useState("");
  const [rating, setRating] = useState(7);
  const [durationDays, setDurationDays] = useState(90);
  const [file, setFile] = useState(null);
  const [newEmployerAddr, setNewEmployerAddr] = useState("");
  const [revokeAddr, setRevokeAddr] = useState("");
  const [lookupAddr, setLookupAddr] = useState("");

  const notify = useCallback((msg, type = "info") => {
    setToast({ msg, type });
    if (window.__vwToastTimer) window.clearTimeout(window.__vwToastTimer);
    window.__vwToastTimer = window.setTimeout(() => setToast({ msg: "", type: "" }), 5000);
  }, []);

  const switchToSepolia = useCallback(async () => {
    if (!window.ethereum) return;
    try {
      await window.ethereum.request({ method: "wallet_switchEthereumChain", params: [{ chainId: SEPOLIA_CHAIN_ID }] });
      setWrongNetwork(false);
    } catch (err) {
      if (err.code === 4902) {
        try {
          await window.ethereum.request({ method: "wallet_addEthereumChain", params: [SEPOLIA_NETWORK] });
          setWrongNetwork(false);
        } catch {
          notify("Failed to add Sepolia network.", "error");
        }
      }
    }
  }, [notify]);

  const connectWallet = useCallback(async (redirect = false, navigate) => {
    if (!window.ethereum) return notify("Install MetaMask to continue.", "error");
    if (!CONTRACT_ADDRESS) return notify("Contract address not configured.", "error");

    const chainId = await window.ethereum.request({ method: "eth_chainId" });
    if (chainId !== SEPOLIA_CHAIN_ID) {
      setWrongNetwork(true);
      notify("Switching to Sepolia Testnet...", "info");
      await switchToSepolia();

      const newChainId = await window.ethereum.request({ method: "eth_chainId" });
      if (newChainId !== SEPOLIA_CHAIN_ID) return notify("Please switch to Sepolia manually.", "error");
    }

    setWrongNetwork(false);

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      const addr = accounts[0];
      const signer = await provider.getSigner();
      const contractInstance = new ethers.Contract(CONTRACT_ADDRESS, VeriWorkJSON.abi, signer);

      setAccount(addr);
      setContract(contractInstance);

      const adminAddr = await contractInstance.admin();
      setAdminAddress(adminAddr);
      setIsAdmin(addr.toLowerCase() === adminAddr.toLowerCase());

      notify("Wallet connected to Sepolia.", "success");
      if (redirect && navigate) navigate("/admin", { replace: true });
    } catch (err) {
      notify(err.message, "error");
    }
  }, [notify, switchToSepolia]);

  const disconnectWallet = useCallback((navigate) => {
    setAccount("");
    setContract(null);
    setIsAdmin(false);
    setAdminAddress("");
    setWorkerRecords([]);
    setReputation(null);
    setLookupScore(null);
    setLookupRecords([]);
    setWrongNetwork(false);
    notify("Session terminated.", "info");
    if (navigate) navigate("/", { replace: true });
  }, [notify]);

  useEffect(() => {
    if (!window.ethereum) return;

    window.ethereum.request({ method: "eth_accounts" }).then((accs) => {
      if (accs.length) connectWallet(false);
    });

    const reload = () => window.location.reload();
    window.ethereum.on("accountsChanged", reload);
    window.ethereum.on("chainChanged", reload);

    return () => {
      window.ethereum.removeListener("accountsChanged", reload);
      window.ethereum.removeListener("chainChanged", reload);
    };
  }, [connectWallet]);

  const uploadToPinata = async (fileObj) => {
    const form = new FormData();
    form.append("file", fileObj);
    const res = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", form, {
      headers: { pinata_api_key: PINATA_API_KEY, pinata_secret_api_key: PINATA_SECRET },
      maxBodyLength: Infinity,
    });
    return res.data.IpfsHash;
  };

  const handleAddEmployer = async (e) => {
    e.preventDefault();
    if (!isAdmin) return notify("Only admin can do this.", "error");
    if (!ethers.isAddress(newEmployerAddr)) return notify("Invalid address.", "error");

    try {
      setAdminBusy(true);
      notify("Confirm in MetaMask...", "info");
      const tx = await contract.addEmployer(newEmployerAddr);
      await tx.wait();
      notify(`Employer registered: ${shortAddr(newEmployerAddr)}`, "success");
      setNewEmployerAddr("");
    } catch (err) {
      notify(err.reason ?? err.message, "error");
    } finally {
      setAdminBusy(false);
    }
  };

  const handleRevokeEmployer = async (e) => {
    e.preventDefault();
    if (!isAdmin) return notify("Only admin can do this.", "error");
    if (!ethers.isAddress(revokeAddr)) return notify("Invalid address.", "error");

    try {
      setAdminBusy(true);
      notify("Confirm in MetaMask...", "info");
      const tx = await contract.revokeEmployer(revokeAddr);
      await tx.wait();
      notify(`Employer revoked: ${shortAddr(revokeAddr)}`, "success");
      setRevokeAddr("");
    } catch (err) {
      notify(err.reason ?? err.message, "error");
    } finally {
      setAdminBusy(false);
    }
  };

  const submitRecord = async (e) => {
    e.preventDefault();
    if (!contract) return notify("Connect wallet first.", "error");
    if (!file) return notify("Attach a document.", "error");
    if (!ethers.isAddress(workerAddr)) return notify("Invalid worker address.", "error");

    try {
      setBusy(true);
      notify("Uploading to IPFS...", "info");
      const ipfsHash = await uploadToPinata(file);
      notify("Confirm transaction in MetaMask...", "info");
      const tx = await contract.submitRecord(workerAddr, ipfsHash, rating, durationDays);
      await tx.wait();
      notify("Record minted to blockchain.", "success");
      setWorkerAddr("");
      setFile(null);
      setRating(7);
      setDurationDays(90);
    } catch (err) {
      notify(err.reason ?? err.message, "error");
    } finally {
      setBusy(false);
    }
  };

  const fetchWorkerData = useCallback(async (addr) => {
    if (!contract || !ethers.isAddress(addr)) return;

    try {
      setLoadingRec(true);
      const ids = await contract.getWorkerRecordIds(addr);
      const fetched = await Promise.all(ids.map(async (id) => {
        const record = await contract.records(id);
        return {
          id: Number(record.id),
          worker: record.worker,
          employer: record.employer,
          ipfsHash: record.ipfsHash,
          rating: Number(record.rating),
          durationDays: Number(record.durationDays),
          isVerified: record.isVerified,
          timestamp: Number(record.timestamp),
        };
      }));

      setWorkerRecords(fetched);
      const score = await contract.getReputation(addr);
      setReputation(Number(score));
    } catch (err) {
      notify(err.message, "error");
    } finally {
      setLoadingRec(false);
    }
  }, [contract, notify]);

  const lookupWorker = async (e) => {
    e.preventDefault();
    if (!contract) return notify("Connect wallet first.", "error");
    if (!ethers.isAddress(lookupAddr)) return notify("Invalid address.", "error");

    try {
      setLoadingLookup(true);
      const score = await contract.getReputation(lookupAddr);
      setLookupScore(Number(score));

      const ids = await contract.getWorkerRecordIds(lookupAddr);
      const fetched = await Promise.all(ids.map(async (id) => {
        const record = await contract.records(id);
        return {
          id: Number(record.id),
          employer: record.employer,
          rating: Number(record.rating),
          durationDays: Number(record.durationDays),
          isVerified: record.isVerified,
        };
      }));

      setLookupRecords(fetched);
    } catch (err) {
      notify(err.reason ?? err.message, "error");
    } finally {
      setLoadingLookup(false);
    }
  };

  const value = useMemo(() => ({
    account,
    contract,
    toast,
    wrongNetwork,
    adminAddress,
    isAdmin,
    adminBusy,
    busy,
    workerRecords,
    reputation,
    loadingRec,
    lookupScore,
    lookupRecords,
    loadingLookup,
    workerAddr,
    rating,
    durationDays,
    file,
    newEmployerAddr,
    revokeAddr,
    lookupAddr,
    setWorkerAddr,
    setRating,
    setDurationDays,
    setFile,
    setNewEmployerAddr,
    setRevokeAddr,
    setLookupAddr,
    notify,
    connectWallet,
    disconnectWallet,
    switchToSepolia,
    handleAddEmployer,
    handleRevokeEmployer,
    submitRecord,
    fetchWorkerData,
    lookupWorker,
  }), [
    account,
    contract,
    toast,
    wrongNetwork,
    adminAddress,
    isAdmin,
    adminBusy,
    busy,
    workerRecords,
    reputation,
    loadingRec,
    lookupScore,
    lookupRecords,
    loadingLookup,
    workerAddr,
    rating,
    durationDays,
    file,
    newEmployerAddr,
    revokeAddr,
    lookupAddr,
    notify,
    connectWallet,
    disconnectWallet,
    switchToSepolia,
    handleAddEmployer,
    handleRevokeEmployer,
    submitRecord,
    fetchWorkerData,
    lookupWorker,
  ]);

  return (
    <VeriWorkContext.Provider value={value}>
      {children}
    </VeriWorkContext.Provider>
  );
}

export function useVeriWork() {
  const ctx = useContext(VeriWorkContext);
  if (!ctx) throw new Error("useVeriWork must be inside VeriWorkProvider");
  return ctx;
}
