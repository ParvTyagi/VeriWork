import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import axios from "axios";
import VeriWorkJSON from "./VeriWork.json";
import RecordCard from "./components/RecordCard";
import VerifyRecordWidget from "./components/VerifyRecordWidget";
import ThemeToggle from "./components/ThemeToggle";
import { ThemeProvider } from "./components/ThemeContext"; // FIXED: was ./components/ThemeContext

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;
const PINATA_API_KEY   = import.meta.env.VITE_PINATA_API_KEY;
const PINATA_SECRET    = import.meta.env.VITE_PINATA_SECRET_API_KEY;

// Sepolia Testnet
const SEPOLIA_CHAIN_ID = "0xaa36a7"; // 11155111 in hex
const SEPOLIA_NETWORK  = {
  chainId: SEPOLIA_CHAIN_ID,
  chainName: "Sepolia Testnet",
  nativeCurrency: { name: "SepoliaETH", symbol: "ETH", decimals: 18 },
  rpcUrls: ["https://rpc.sepolia.org"],
  blockExplorerUrls: ["https://sepolia.etherscan.io"],
};

const shortAddr = (a) => `${a.slice(0, 6)}...${a.slice(-4)}`;
const TABS = [
  { id: "Admin",     icon: "🔑" },
  { id: "Employer",  icon: "🏢" },
  { id: "Worker",    icon: "👤" },
  { id: "Recruiter", icon: "🔍" },
];

function VeriWorkApp() {
  const [account, setAccount]           = useState("");
  const [contract, setContract]         = useState(null);
  const [tab, setTab]                   = useState("Admin");
  const [toast, setToast]               = useState({ msg: "", type: "" });
  const [wrongNetwork, setWrongNetwork] = useState(false);

  // admin
  const [adminAddress, setAdminAddress]       = useState("");
  const [isAdmin, setIsAdmin]                 = useState(false);
  const [newEmployerAddr, setNewEmployerAddr] = useState("");
  const [revokeAddr, setRevokeAddr]           = useState("");
  const [adminBusy, setAdminBusy]             = useState(false);

  // employer
  const [workerAddr, setWorkerAddr]     = useState("");
  const [rating, setRating]             = useState(7);
  const [durationDays, setDurationDays] = useState(90);
  const [file, setFile]                 = useState(null);
  const [busy, setBusy]                 = useState(false);

  // worker
  const [workerRecords, setWorkerRecords] = useState([]);
  const [reputation, setReputation]       = useState(null);
  const [loadingRec, setLoadingRec]       = useState(false);

  // recruiter
  const [lookupAddr, setLookupAddr]       = useState("");
  const [lookupScore, setLookupScore]     = useState(null);
  const [lookupRecords, setLookupRecords] = useState([]);
  const [loadingLookup, setLoadingLookup] = useState(false);

  // ── toast ──────────────────────────────────────────────────────────────────
  const notify = useCallback((msg, type = "info") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "" }), 5000);
  }, []);

  // ── switch to Sepolia ──────────────────────────────────────────────────────
  const switchToSepolia = async () => {
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: SEPOLIA_CHAIN_ID }],
      });
    } catch (err) {
      // Chain not added yet — add it
      if (err.code === 4902) {
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [SEPOLIA_NETWORK],
          });
        } catch {
          notify("Failed to add Sepolia network.", "error");
        }
      }
    }
  };

  // ── wallet ─────────────────────────────────────────────────────────────────
  const connectWallet = useCallback(async () => {
    if (!window.ethereum) return notify("Install MetaMask to continue.", "error");
    if (!CONTRACT_ADDRESS) return notify("Contract address not configured. Check Vercel env vars.", "error");

    // Check network
    const chainId = await window.ethereum.request({ method: "eth_chainId" });
    if (chainId !== SEPOLIA_CHAIN_ID) {
      setWrongNetwork(true);
      notify("Switching to Sepolia Testnet...", "info");
      await switchToSepolia();
      const newChainId = await window.ethereum.request({ method: "eth_chainId" });
      if (newChainId !== SEPOLIA_CHAIN_ID) {
        return notify("Please switch to Sepolia Testnet manually.", "error");
      }
    }
    setWrongNetwork(false);

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      const addr = accounts[0];
      setAccount(addr);
      const signer = await provider.getSigner();
      const c = new ethers.Contract(CONTRACT_ADDRESS, VeriWorkJSON.abi, signer);
      setContract(c);
      const adminAddr = await c.admin();
      setAdminAddress(adminAddr);
      setIsAdmin(addr.toLowerCase() === adminAddr.toLowerCase());
      notify("Wallet connected to Sepolia.", "success");
    } catch (err) {
      notify(err.message, "error");
    }
  }, [notify]);

  const disconnectWallet = () => {
    setAccount(""); setContract(null); setIsAdmin(false);
    setAdminAddress(""); setWorkerRecords([]); setReputation(null);
    setLookupScore(null); setLookupRecords([]);
    notify("Disconnected.", "info");
  };

  // listen for network/account changes
  useEffect(() => {
    if (!window.ethereum) return;

    window.ethereum.request({ method: "eth_accounts" })
      .then((accs) => { if (accs.length) connectWallet(); });

    const handleAccountsChanged = () => window.location.reload();
    const handleChainChanged    = () => window.location.reload();

    window.ethereum.on("accountsChanged", handleAccountsChanged);
    window.ethereum.on("chainChanged",    handleChainChanged);

    return () => {
      window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
      window.ethereum.removeListener("chainChanged",    handleChainChanged);
    };
  }, [connectWallet]);

  // ── Pinata ─────────────────────────────────────────────────────────────────
  const uploadToPinata = async (fileObj) => {
    const form = new FormData();
    form.append("file", fileObj);
    const res = await axios.post(
      "https://api.pinata.cloud/pinning/pinFileToIPFS",
      form,
      {
        headers: {
          pinata_api_key: PINATA_API_KEY,
          pinata_secret_api_key: PINATA_SECRET,
        },
        maxBodyLength: "Infinity",
      }
    );
    return res.data.IpfsHash;
  };

  // ── admin ──────────────────────────────────────────────────────────────────
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
    } finally { setAdminBusy(false); }
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
    } finally { setAdminBusy(false); }
  };

  // ── employer ───────────────────────────────────────────────────────────────
  const submitRecord = async (e) => {
    e.preventDefault();
    if (!contract) return notify("Connect wallet first.", "error");
    if (!file)     return notify("Attach a document.", "error");
    if (!ethers.isAddress(workerAddr)) return notify("Invalid worker address.", "error");
    try {
      setBusy(true);
      notify("Uploading to IPFS...", "info");
      const ipfsHash = await uploadToPinata(file);
      notify("Confirm transaction in MetaMask...", "info");
      const tx = await contract.submitRecord(workerAddr, ipfsHash, rating, durationDays);
      await tx.wait();
      notify("Record submitted!", "success");
      setWorkerAddr(""); setFile(null); setRating(7); setDurationDays(90);
    } catch (err) {
      notify(err.reason ?? err.message, "error");
    } finally { setBusy(false); }
  };

  // ── worker ─────────────────────────────────────────────────────────────────
  const fetchWorkerData = useCallback(async (addr) => {
    if (!contract || !ethers.isAddress(addr)) return;
    try {
      setLoadingRec(true);
      const ids = await contract.getWorkerRecordIds(addr);
      const fetched = await Promise.all(
        ids.map(async (id) => {
          const r = await contract.records(id);
          return {
            id: Number(r.id), worker: r.worker, employer: r.employer,
            ipfsHash: r.ipfsHash, rating: Number(r.rating),
            durationDays: Number(r.durationDays),
            isVerified: r.isVerified, timestamp: Number(r.timestamp),
          };
        })
      );
      setWorkerRecords(fetched);
      const score = await contract.getReputation(addr);
      setReputation(Number(score));
    } catch (err) {
      notify(err.message, "error");
    } finally { setLoadingRec(false); }
  }, [contract, notify]);

  useEffect(() => {
    if (tab === "Worker" && account && contract) fetchWorkerData(account);
  }, [tab, account, contract, fetchWorkerData]);

  // ── recruiter ──────────────────────────────────────────────────────────────
  const lookupWorker = async (e) => {
    e.preventDefault();
    if (!contract) return notify("Connect wallet first.", "error");
    if (!ethers.isAddress(lookupAddr)) return notify("Invalid address.", "error");
    try {
      setLoadingLookup(true);
      const score = await contract.getReputation(lookupAddr);
      setLookupScore(Number(score));
      const ids = await contract.getWorkerRecordIds(lookupAddr);
      const fetched = await Promise.all(
        ids.map(async (id) => {
          const r = await contract.records(id);
          return {
            id: Number(r.id), employer: r.employer,
            rating: Number(r.rating), durationDays: Number(r.durationDays),
            isVerified: r.isVerified,
          };
        })
      );
      setLookupRecords(fetched);
    } catch (err) {
      notify(err.reason ?? err.message, "error");
    } finally { setLoadingLookup(false); }
  };

  const scoreColor = (n) =>
    n >= 200 ? "text-success drop-shadow-[0_0_8px_rgba(54,211,153,0.5)]" :
    n >= 100 ? "text-primary" : "text-warning";

  // ── render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-base-200 via-base-100 to-base-300 flex flex-col font-sans transition-colors duration-300">

      {/* ── Wrong Network Banner ── */}
      {wrongNetwork && (
        <div className="bg-error text-error-content px-4 py-3 flex items-center justify-between gap-4 z-[200]">
          <span className="text-sm font-bold">
            Wrong network detected. VeriWork requires Sepolia Testnet.
          </span>
          <button
            className="btn btn-sm btn-outline border-error-content text-error-content rounded-full"
            onClick={switchToSepolia}
          >
            Switch to Sepolia
          </button>
        </div>
      )}

      {/* ── Navbar ── */}
      <div className="navbar bg-base-100/60 backdrop-blur-lg border-b border-base-content/10 sticky top-0 z-50 px-4 md:px-8 shadow-sm">
        <div className="navbar-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-primary-content shadow-lg shadow-primary/30">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </div>
          <span className="font-extrabold text-xl tracking-tight" style={{ fontFamily: "Syne, sans-serif" }}>
            VeriWork
          </span>
          <div className="badge badge-primary badge-sm font-bold shadow-sm">BETA</div>
        </div>

        <div className="navbar-end gap-3">
          <ThemeToggle />
          {account ? (
            <div className="flex items-center gap-2 bg-base-200/50 p-1 pr-2 rounded-full border border-base-content/5">
              {isAdmin && <span className="badge badge-warning badge-sm font-bold ml-1">Admin</span>}
              <div className="badge badge-ghost font-mono text-xs border-none">{shortAddr(account)}</div>
              <button
                className="btn btn-xs btn-circle btn-ghost text-base-content/50 hover:text-error hover:bg-error/10 transition-colors"
                onClick={disconnectWallet}
                title="Disconnect"
              >
                x
              </button>
            </div>
          ) : (
            <button
              className="btn btn-primary btn-sm rounded-full px-6 shadow-md shadow-primary/20 hover:-translate-y-0.5 transition-transform"
              onClick={connectWallet}
            >
              Connect Wallet
            </button>
          )}
        </div>
      </div>

      {/* ── Toast ── */}
      {toast.msg && (
        <div className="toast toast-center toast-bottom z-[9999] transition-all">
          <div className={`alert shadow-2xl rounded-2xl border-l-4 ${
            toast.type === "success" ? "alert-success border-success" :
            toast.type === "error"   ? "alert-error border-error"     :
            "alert-info border-info"
          }`}>
            <span className="text-sm font-bold">{toast.msg}</span>
          </div>
        </div>
      )}

      {/* ── Hero ── */}
      {!account && (
        <div className="hero flex-1 relative overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[100px] pointer-events-none mix-blend-screen" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-[100px] pointer-events-none mix-blend-screen" />

          <div className="hero-content text-center flex-col gap-8 py-24 max-w-3xl relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-base-200/80 border border-base-content/10 text-xs font-bold uppercase tracking-widest shadow-sm backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
              Zero-Knowledge &nbsp;·&nbsp; Privacy-First
            </div>

            <h1 className="text-6xl md:text-7xl font-extrabold leading-tight tracking-tighter" style={{ fontFamily: "Syne, sans-serif" }}>
              Verify work.<br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
                Reveal nothing.
              </span>
            </h1>

            <p className="text-base-content/70 text-lg md:text-xl leading-relaxed max-w-2xl font-medium">
              VeriWork lets employers record verified experience directly on-chain. Workers prove credentials using cryptography — absolutely no sensitive data is ever exposed.
            </p>

            <div className="flex gap-4 flex-wrap justify-center mt-4">
              <button className="btn btn-primary btn-lg rounded-full px-10 shadow-xl shadow-primary/30 hover:-translate-y-1 transition-all" onClick={connectWallet}>
                Connect MetaMask
              </button>
              <a href="https://github.com" target="_blank" rel="noreferrer" className="btn btn-outline btn-lg rounded-full px-8 hover:-translate-y-1 transition-all">
                View Documentation
              </a>
            </div>

            <div className="flex gap-3 flex-wrap justify-center mt-8 opacity-80">
              {["Decentralized Storage", "Immutable Records", "zk-SNARKs", "Reputation Scoring"].map((f) => (
                <div key={f} className="badge badge-ghost badge-lg border-base-content/20">{f}</div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Main Panel ── */}
      {account && (
        <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-10 fade-in relative z-10">

          {/* Tabs */}
          <div className="flex p-1.5 space-x-2 bg-base-200/80 backdrop-blur-md rounded-2xl mb-8 shadow-inner border border-base-content/5">
            {TABS.map(({ id, icon }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2
                  ${tab === id
                    ? "bg-base-100 shadow-md text-primary scale-100"
                    : "text-base-content/60 hover:bg-base-300/50 hover:text-base-content scale-95 hover:scale-100"
                  }`}
              >
                <span className="text-lg">{icon}</span> {id}
              </button>
            ))}
          </div>

          {/* ── ADMIN TAB ── */}
          {tab === "Admin" && (
            <div className="card bg-base-100/80 backdrop-blur-xl shadow-2xl shadow-base-300/50 border border-base-content/5 rounded-3xl fade-in overflow-hidden">
              <div className="bg-gradient-to-r from-base-200 to-transparent h-1 w-full" />
              <div className="card-body p-8 gap-8">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight mb-1" style={{ fontFamily: "Syne, sans-serif" }}>Admin Panel</h2>
                  <p className="text-base-content/60 text-sm">Manage company wallets authorized to issue cryptographic work proofs.</p>
                </div>

                <div className={`alert rounded-2xl border ${isAdmin ? "bg-success/10 border-success/20 text-success-content" : "bg-warning/10 border-warning/20 text-warning-content"}`}>
                  <span className="text-2xl">{isAdmin ? "🛡️" : "⚠️"}</span>
                  <div>
                    <h3 className="font-bold">{isAdmin ? "Admin Access Granted" : "Read-Only Mode"}</h3>
                    <div className="text-sm mt-1 opacity-90">
                      {isAdmin
                        ? "You have elevated privileges to register and revoke employer addresses."
                        : <>Switch MetaMask to <code className="font-mono bg-base-300/50 px-1.5 py-0.5 rounded text-xs">{shortAddr(adminAddress)}</code> to make changes.</>
                      }
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  {/* Add employer */}
                  <div className="bg-base-200/50 p-6 rounded-2xl border border-base-content/5">
                    <h3 className="font-bold text-lg mb-1 text-success flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                      </svg>
                      Register
                    </h3>
                    <p className="text-xs text-base-content/60 mb-4">Grant a wallet permission to submit work records.</p>
                    <form onSubmit={handleAddEmployer} className="flex flex-col gap-3">
                      <input
                        className="input input-bordered bg-base-100 font-mono text-sm rounded-xl"
                        placeholder="0x..."
                        value={newEmployerAddr}
                        onChange={(e) => setNewEmployerAddr(e.target.value)}
                        disabled={!isAdmin}
                        required
                      />
                      {isAdmin && (
                        <button
                          type="button"
                          className="btn btn-ghost btn-xs self-start text-primary"
                          onClick={() => setNewEmployerAddr(account)}
                        >
                          Use my wallet
                        </button>
                      )}
                      <button
                        type="submit"
                        className={`btn btn-success text-success-content rounded-xl shadow-md shadow-success/20 ${adminBusy ? "loading" : ""}`}
                        disabled={adminBusy || !isAdmin}
                      >
                        {!adminBusy && "Authorize Wallet"}
                      </button>
                    </form>
                  </div>

                  {/* Revoke employer */}
                  <div className="bg-base-200/50 p-6 rounded-2xl border border-base-content/5">
                    <h3 className="font-bold text-lg mb-1 text-error flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      Revoke
                    </h3>
                    <p className="text-xs text-base-content/60 mb-4">Remove submit access. Existing records remain immutable.</p>
                    <form onSubmit={handleRevokeEmployer} className="flex flex-col gap-3">
                      <input
                        className="input input-bordered bg-base-100 font-mono text-sm rounded-xl"
                        placeholder="0x..."
                        value={revokeAddr}
                        onChange={(e) => setRevokeAddr(e.target.value)}
                        disabled={!isAdmin}
                        required
                      />
                      <button
                        type="submit"
                        className={`btn btn-error text-error-content rounded-xl shadow-md shadow-error/20 ${adminBusy ? "loading" : ""}`}
                        disabled={adminBusy || !isAdmin}
                      >
                        {!adminBusy && "Revoke Access"}
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── EMPLOYER TAB ── */}
          {tab === "Employer" && (
            <div className="card bg-base-100/80 backdrop-blur-xl shadow-2xl shadow-base-300/50 border border-base-content/5 rounded-3xl fade-in">
              <div className="card-body p-8 gap-6">
                <div className="border-b border-base-content/10 pb-4 mb-2">
                  <h2 className="text-2xl font-bold tracking-tight" style={{ fontFamily: "Syne, sans-serif" }}>Issue Work Record</h2>
                  <p className="text-sm text-base-content/60 mt-1">
                    Mint an immutable performance proof to the blockchain.{" "}
                    <button className="link link-primary" onClick={() => setTab("Admin")}>
                      Need to register first?
                    </button>
                  </p>
                </div>

                <form onSubmit={submitRecord} className="flex flex-col gap-6">
                  <div className="form-control">
                    <label className="label pb-2">
                      <span className="label-text text-xs font-extrabold uppercase tracking-widest text-base-content/70">Worker Address</span>
                    </label>
                    <input
                      className="input input-bordered bg-base-200/50 font-mono text-sm rounded-xl"
                      placeholder="0x..."
                      value={workerAddr}
                      onChange={(e) => setWorkerAddr(e.target.value)}
                      required
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="form-control bg-base-200/30 p-4 rounded-2xl border border-base-content/5">
                      <label className="label pb-3 pt-0">
                        <span className="label-text text-xs font-extrabold uppercase tracking-widest text-base-content/70">Performance Rating</span>
                        <span className="badge badge-primary font-bold shadow-sm">{rating} / 10</span>
                      </label>
                      <div className="flex gap-1.5 flex-wrap">
                        {[1,2,3,4,5,6,7,8,9,10].map((n) => (
                          <button
                            key={n} type="button" onClick={() => setRating(n)}
                            className={`flex-1 min-w-[32px] h-10 rounded-lg text-sm font-bold transition-all ${
                              rating === n ? "bg-primary text-primary-content shadow-md shadow-primary/30 scale-105"
                              : n < rating ? "bg-primary/20 text-primary hover:bg-primary/40"
                              : "bg-base-300 text-base-content/50 hover:text-base-content"
                            }`}
                          >
                            {n}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="form-control bg-base-200/30 p-4 rounded-2xl border border-base-content/5">
                      <label className="label pb-3 pt-0">
                        <span className="label-text text-xs font-extrabold uppercase tracking-widest text-base-content/70">Duration (Days)</span>
                      </label>
                      <input
                        className="input input-bordered bg-base-100 rounded-xl"
                        type="number" min="1" value={durationDays}
                        onChange={(e) => setDurationDays(Number(e.target.value))} required
                      />
                      <label className="label pt-2 pb-0">
                        <span className="text-xs text-base-content/50">
                          Score Impact:{" "}
                          <span className="text-primary font-bold bg-primary/10 px-2 py-0.5 rounded-full">
                            +{Math.min((rating * 10) + (Math.floor(durationDays / 30) * 5), 200)} pts
                          </span>
                        </span>
                      </label>
                    </div>
                  </div>

                  <div className="form-control">
                    <label className="label pb-2">
                      <span className="label-text text-xs font-extrabold uppercase tracking-widest text-base-content/70">Work Proof (PDF/Image)</span>
                    </label>
                    <input
                      type="file"
                      className="file-input file-input-bordered file-input-primary w-full bg-base-200/50 rounded-xl cursor-pointer"
                      onChange={(e) => setFile(e.target.files[0])}
                      accept=".pdf,.png,.jpg,.jpeg"
                    />
                  </div>

                  <button
                    type="submit"
                    className={`btn btn-primary btn-lg rounded-xl shadow-xl shadow-primary/20 hover:-translate-y-0.5 transition-all ${busy ? "loading" : ""}`}
                    disabled={busy}
                  >
                    {!busy && "Mint to Blockchain"}
                  </button>
                </form>

                <div className="divider my-2">OR</div>

                <div className="bg-base-200/50 p-6 rounded-2xl border border-base-content/5">
                  <h3 className="font-bold mb-1 flex items-center gap-2">
                    <span>✅</span> Verify Pending Record
                  </h3>
                  <p className="text-sm text-base-content/60 mb-4">
                    Approve an existing on-chain claim to finalize reputation scoring.
                  </p>
                  <VerifyRecordWidget contract={contract} notify={notify} onSuccess={() => fetchWorkerData(account)} />
                </div>
              </div>
            </div>
          )}

          {/* ── WORKER TAB ── */}
          {tab === "Worker" && (
            <div className="card bg-base-100/80 backdrop-blur-xl shadow-2xl shadow-base-300/50 border border-base-content/5 rounded-3xl fade-in overflow-hidden">
              <div className="card-body p-0">
                <div className="bg-gradient-to-br from-base-200 to-base-100 p-8 border-b border-base-content/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                  <div>
                    <h2 className="text-3xl font-extrabold tracking-tight mb-2" style={{ fontFamily: "Syne, sans-serif" }}>My Reputation</h2>
                    <div className="inline-flex items-center gap-2 bg-base-100 py-1.5 px-3 rounded-lg border border-base-content/10 shadow-sm">
                      <div className="w-2 h-2 rounded-full bg-success" />
                      <span className="font-mono text-sm opacity-80 truncate max-w-[200px]">{account}</span>
                    </div>
                  </div>

                  <div className="bg-base-100 p-5 rounded-2xl shadow-lg border border-base-content/5 min-w-[140px] flex flex-col items-center justify-center">
                    <div className="text-xs font-bold uppercase tracking-widest text-base-content/50 mb-1">Total Score</div>
                    <div className={`text-5xl font-extrabold ${reputation ? scoreColor(reputation) : "text-base-content/20"}`} style={{ fontFamily: "Syne, sans-serif" }}>
                      {reputation ?? "-"}
                    </div>
                  </div>
                </div>

                <div className="p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-lg">Verified Work History</h3>
                    <button
                      className={`btn btn-sm btn-ghost hover:bg-base-200 rounded-full ${loadingRec ? "loading" : ""}`}
                      onClick={() => fetchWorkerData(account)}
                      disabled={loadingRec}
                    >
                      {!loadingRec && "Refresh"}
                    </button>
                  </div>

                  {loadingRec ? (
                    <div className="flex flex-col gap-4">
                      {[1,2].map((i) => <div key={i} className="skeleton h-32 rounded-2xl w-full opacity-50" />)}
                    </div>
                  ) : workerRecords.length === 0 ? (
                    <div className="text-center py-16 bg-base-200/30 rounded-2xl border border-dashed border-base-content/20">
                      <div className="text-5xl mb-3 opacity-20">📭</div>
                      <h4 className="font-bold text-lg">No Records Found</h4>
                      <p className="text-sm text-base-content/50 mt-1">Ask your employer to issue a VeriWork proof.</p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-4">
                      {workerRecords.map((rec) => <RecordCard key={rec.id} rec={rec} showEmployer />)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── RECRUITER TAB ── */}
          {tab === "Recruiter" && (
            <div className="card bg-base-100/80 backdrop-blur-xl shadow-2xl shadow-base-300/50 border border-base-content/5 rounded-3xl fade-in">
              <div className="card-body p-8 gap-6">
                <div className="text-center max-w-lg mx-auto mb-4">
                  <div className="w-16 h-16 bg-secondary/10 text-secondary rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <h2 className="text-3xl font-bold tracking-tight mb-2" style={{ fontFamily: "Syne, sans-serif" }}>Candidate Verification</h2>
                  <p className="text-sm text-base-content/60">
                    Enter a wallet address to instantly verify cryptographically signed work history. No raw data is ever exposed.
                  </p>
                </div>

                <form onSubmit={lookupWorker} className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto w-full">
                  <input
                    className="input input-bordered input-lg font-mono text-sm flex-1 rounded-2xl shadow-inner bg-base-200/50"
                    placeholder="0x..."
                    value={lookupAddr}
                    onChange={(e) => setLookupAddr(e.target.value)}
                    required
                  />
                  <button
                    type="submit"
                    className={`btn btn-secondary btn-lg rounded-2xl shadow-lg shadow-secondary/20 ${loadingLookup ? "loading" : ""}`}
                    disabled={loadingLookup}
                  >
                    {!loadingLookup && "Verify"}
                  </button>
                </form>

                {lookupScore !== null && (
                  <div className="fade-in flex flex-col gap-6 mt-6">
                    <div className="divider opacity-50">Verification Results</div>

                    <div className="stats stats-vertical sm:stats-horizontal shadow-xl bg-gradient-to-r from-base-200 to-base-100 border border-base-content/10 rounded-2xl">
                      <div className="stat place-items-center">
                        <div className="stat-title text-xs font-bold uppercase tracking-widest text-base-content/50 mb-1">Reputation Score</div>
                        <div className={`stat-value text-5xl ${scoreColor(lookupScore)}`} style={{ fontFamily: "Syne, sans-serif" }}>
                          {lookupScore}
                        </div>
                        <div className="stat-desc font-mono text-xs mt-2 bg-base-300 px-2 py-1 rounded">{shortAddr(lookupAddr)}</div>
                      </div>
                      <div className="stat place-items-center">
                        <div className="stat-title text-xs font-bold uppercase tracking-widest text-base-content/50 mb-1">Blockchain Proofs</div>
                        <div className="stat-value text-4xl" style={{ fontFamily: "Syne, sans-serif" }}>
                          {lookupRecords.length}
                        </div>
                        <div className="stat-desc text-success font-bold mt-2">
                          {lookupRecords.filter(r => r.isVerified).length} fully verified
                        </div>
                      </div>
                    </div>

                    <h4 className="font-bold text-lg pl-2">On-Chain Ledger</h4>

                    {lookupRecords.length === 0 ? (
                      <div className="text-center py-10 bg-base-200/50 rounded-2xl border border-base-content/5 text-base-content/40 text-sm">
                        No records found for this address.
                      </div>
                    ) : (
                      <div className="flex flex-col gap-4">
                        {lookupRecords.map((rec) => (
                          <RecordCard key={rec.id} rec={rec} recruiterView />
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      )}

      {/* ── Footer ── */}
      <footer className="footer footer-center p-6 bg-base-100/50 backdrop-blur-md border-t border-base-content/5 text-base-content/50 text-sm mt-auto">
        <div className="flex gap-4 items-center flex-wrap justify-center">
          <span className="font-bold tracking-tight" style={{ fontFamily: "Syne, sans-serif" }}>
            VeriWork &copy; {new Date().getFullYear()}
          </span>
          <span className="opacity-30">|</span>
          <span className="font-mono text-xs bg-base-300 px-2 py-1 rounded-md">Sepolia · IPFS · zk-SNARKs</span>
          <span className="opacity-30">|</span>
          <a href="https://github.com" target="_blank" rel="noreferrer" className="link link-hover hover:text-primary transition-colors">
            Source Code
          </a>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <VeriWorkApp />
    </ThemeProvider>
  );
}