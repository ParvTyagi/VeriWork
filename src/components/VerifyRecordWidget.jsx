import { useState } from "react";

export default function VerifyRecordWidget({ contract, notify, onSuccess }) {
  const [recordId, setRecordId] = useState("");
  const [busy, setBusy] = useState(false);
  const parsedId = Number(recordId);
  const hasValue = recordId.trim().length > 0;
  const isValidId = Number.isInteger(parsedId) && parsedId > 0;

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!contract || !isValidId) {
      if (!isValidId) notify("Enter a valid record ID greater than 0.", "error");
      return;
    }
    try {
      setBusy(true);
      notify(`Verifying record #${recordId}... confirm in MetaMask.`, "info");
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
    <form onSubmit={handleVerify} className="space-y-5">
      <label className="form-control w-full">
        <div className="label">
          <span className="label-text font-mono text-xs uppercase tracking-wider font-semibold text-base-content/70">Record ID to Verify</span>
        </div>
        <input
          className={`input font-mono rounded-lg ${hasValue && !isValidId ? "input-error" : "input-bordered"}`}
          type="number"
          min="1"
          placeholder="Enter record number..."
          value={recordId}
          onChange={(e) => setRecordId(e.target.value)}
          required
          disabled={busy}
          autoFocus
        />
        <div className="label pt-2">
          <span className={`label-text-alt text-xs transition ${hasValue && !isValidId ? "text-error font-semibold" : "text-base-content/60"}`}>
            {hasValue && !isValidId 
              ? "✗ Record ID must be a positive whole number" 
              : "ℹ Enter the record index number to confirm"}
          </span>
        </div>
      </label>

      <button 
        type="submit" 
        disabled={busy || !isValidId} 
        className="btn btn-primary mt-1 w-full rounded-lg gap-2 shadow-md shadow-primary/20 transition hover:shadow-primary/30 disabled:opacity-50"
      >
        {busy ? (
          <>
            <span className="loading loading-spinner loading-sm" />
            Verifying Record #{recordId}...
          </>
        ) : (
          <>
            <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            {recordId ? `Verify Record #${recordId}` : "Verify Record"}
          </>
        )}
      </button>
    </form>
  );
}