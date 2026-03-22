import { useState } from "react";

export default function VerifyRecordWidget({ contract, notify, onSuccess }) {
  const [recordId, setRecordId] = useState("");
  const [busy, setBusy] = useState(false);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!contract || !recordId) return;
    try {
      setBusy(true);
      notify(`Verifying record #${recordId}… confirm in MetaMask.`, "info");
      const tx = await contract.verifyRecord(Number(recordId));
      await tx.wait();
      notify(`Record #${recordId} verified and reputation updated!`, "success");
      setRecordId("");
      onSuccess?.();
    } catch (err) {
      notify(err.reason ?? err.message, "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={handleVerify} className="flex flex-col sm:flex-row gap-3">
      <input
        className="input input-bordered focus:ring-2 focus:ring-success/30 transition-shadow font-mono text-sm flex-1 rounded-xl bg-base-100 shadow-inner"
        type="number"
        min="1"
        placeholder="Record ID (e.g. 1)"
        value={recordId}
        onChange={(e) => setRecordId(e.target.value)}
        required
        disabled={busy}
      />
      <button
        type="submit"
        className={`btn btn-success text-success-content rounded-xl shadow-lg shadow-success/20 hover:-translate-y-0.5 transition-transform ${busy ? "loading" : ""}`}
        disabled={busy}
      >
        {!busy && (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Verify On-Chain
          </>
        )}
      </button>
    </form>
  );
}