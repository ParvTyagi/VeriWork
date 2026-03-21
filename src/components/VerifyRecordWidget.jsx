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
    <form onSubmit={handleVerify} className="flex gap-2">
      <input
        className="input input-bordered input-sm flex-1 mono"
        type="number"
        min="1"
        placeholder="Record ID  e.g. 1"
        value={recordId}
        onChange={(e) => setRecordId(e.target.value)}
        required
      />
      <button
        type="submit"
        className={`btn btn-secondary btn-sm ${busy ? "loading" : ""}`}
        disabled={busy}
      >
        {!busy && "Verify"}
      </button>
    </form>
  );
}