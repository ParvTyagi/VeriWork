import RecordCard from "../components/RecordCard";
import VerifyRecordWidget from "../components/VerifyRecordWidget";
import { SectionCard, scoreToneClass, shortAddr } from "../components/VeriWorkShell";

function roleCopy(role) {
  switch (role) {
    case "Admin":
      return {
        title: "Access Control",
        subtitle: "Register or revoke employer wallets that are allowed to issue proofs.",
      };
    case "Employer":
      return {
        title: "Issue Work Record",
        subtitle: "Mint an immutable work proof, upload the document to IPFS, and write the record to chain.",
      };
    case "Worker":
      return {
        title: "My Reputation",
        subtitle: "Review your on-chain score and the records issued for your wallet.",
      };
    case "Recruiter":
      return {
        title: "Candidate Verification",
        subtitle: "Query a wallet address and inspect its issued records without exposing raw document contents.",
      };
    default:
      return { title: role, subtitle: "" };
  }
}

export default function RolePage({
  role,
  account,
  contract,
  isAdmin,
  adminAddress,
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
  handleAddEmployer,
  handleRevokeEmployer,
  submitRecord,
  fetchWorkerData,
  lookupWorker,
}) {
  const copy = roleCopy(role);
  const addressPattern = /^0x[a-fA-F0-9]{40}$/;
  const ratingTone = rating >= 8 ? "text-success" : rating >= 5 ? "text-info" : "text-warning";
  const accessLabel = role === "Admin" ? (isAdmin ? "Authorized" : "Read only") : "Active";
  const accessBadgeTone = role === "Admin" ? (isAdmin ? "badge-success" : "badge-warning") : "badge-info";
  const accessTextTone = role === "Admin" ? (isAdmin ? "text-success" : "text-warning") : "text-info";
  const workerAddrValue = workerAddr.trim();
  const lookupAddrValue = lookupAddr.trim();
  const newEmployerValue = newEmployerAddr.trim();
  const revokeValue = revokeAddr.trim();
  const isWorkerAddrValid = workerAddrValue.length === 0 || addressPattern.test(workerAddrValue);
  const isLookupAddrValid = lookupAddrValue.length === 0 || addressPattern.test(lookupAddrValue);
  const isNewEmployerValid = newEmployerValue.length === 0 || addressPattern.test(newEmployerValue);
  const isRevokeAddrValid = revokeValue.length === 0 || addressPattern.test(revokeValue);
  const isDurationValid = Number.isInteger(durationDays) && durationDays > 0;
  const estimatedImpact = Math.min(rating * 10 + Math.floor(durationDays / 30) * 5, 200);
  const statusTiles = [
    { label: "Network", value: "Sepolia", desc: "Testnet ready" },
    { label: "Account", value: shortAddr(account), desc: "Connected wallet" },
    { label: "Access", value: accessLabel, desc: role === "Admin" ? "Contract admin privileges" : "Role workspace" },
  ];

  return (
    <main className="relative z-10 mx-auto w-full max-w-[1600px] flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="grid gap-6 xl:grid-cols-[20rem_minmax(0,1fr)]">
        <SectionCard
          eyebrow="Workspace"
          title="Session overview"
          subtitle="A quick read on the connected wallet, active network, and current role context."
          className="xl:sticky xl:top-24 xl:self-start"
        >
          <div className="space-y-3 rounded-lg border border-base-300/70 bg-base-100/90 p-4 shadow-sm">
            {statusTiles.map((tile) => (
              <div className="flex items-center justify-between gap-3" key={tile.label}>
                <div>
                  <div className="text-[0.68rem] font-mono uppercase tracking-[0.14em] text-base-content/45">{tile.label}</div>
                  <div className="text-xs text-base-content/55">{tile.desc}</div>
                </div>
                <div
                  className={`text-right font-semibold ${
                    tile.label === "Access" ? accessTextTone : tile.label === "Network" ? "text-primary" : "text-base-content"
                  }`}
                >
                  {tile.value}
                </div>
              </div>
            ))}
          </div>

          <div className="alert border border-info/25 bg-info/10 text-info-content shadow-sm">
            <span className="text-sm">
              One workspace, four flows: issue records, verify records, inspect worker history, and manage employer access.
            </span>
          </div>
        </SectionCard>

        <div className="space-y-6">
          <SectionCard eyebrow={role} title={copy.title} subtitle={copy.subtitle}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-2">
                <div className="badge badge-outline font-mono uppercase tracking-[0.14em]">{role}</div>
                <div className={`badge ${role === "Admin" ? accessBadgeTone : "badge-primary"} badge-outline font-mono`}>{accessLabel}</div>
              </div>
              <div className="text-xs font-mono uppercase tracking-[0.18em] text-base-content/45">Wallet {shortAddr(account)}</div>
            </div>

            {role === "Admin" && (
              <div className="space-y-4">
                <div className={`alert shadow-sm ${isAdmin ? "alert-success" : "alert-warning"}`}>
                  <span>
                    {isAdmin ? "You are connected with the admin wallet." : `Contact Admin ${shortAddr(adminAddress)} to get employer access.`}
                  </span>
                </div>

                <div className="grid gap-5 lg:grid-cols-2">
                  <SurfaceCard accent="Register" title="Authorize employer" tone="text-primary">
                    <form onSubmit={handleAddEmployer} className="space-y-4">
                      <Field label="Wallet address">
                        <input
                          className={`input w-full font-mono ${!isNewEmployerValid ? "input-error" : "input-bordered"}`}
                          placeholder="0x..."
                          value={newEmployerAddr}
                          onChange={(e) => setNewEmployerAddr(e.target.value)}
                          disabled={!isAdmin}
                          required
                        />
                        {!isNewEmployerValid && (
                          <p className="mt-2 text-xs text-error">Enter a valid Ethereum address (0x + 40 hex chars).</p>
                        )}
                      </Field>

                      <div className="mt-2 flex flex-col gap-3 sm:flex-row">
                        {isAdmin && (
                          <button className="btn btn-ghost rounded-lg sm:w-auto" type="button" onClick={() => setNewEmployerAddr(account)}>
                            Use my wallet
                          </button>
                        )}
                        <button className="btn btn-primary flex-1 rounded-lg" type="submit" disabled={adminBusy || !isAdmin || !isNewEmployerValid}>
                          {adminBusy ? <span className="loading loading-spinner loading-sm" /> : newEmployerValue ? `Authorize ${shortAddr(newEmployerValue)}` : "Authorize wallet"}
                        </button>
                      </div>
                    </form>
                  </SurfaceCard>

                  <SurfaceCard accent="Revoke" title="Remove access" tone="text-error">
                    <form onSubmit={handleRevokeEmployer} className="space-y-4">
                      <Field label="Wallet address">
                        <input
                          className={`input w-full font-mono ${!isRevokeAddrValid ? "input-error" : "input-bordered"}`}
                          placeholder="0x..."
                          value={revokeAddr}
                          onChange={(e) => setRevokeAddr(e.target.value)}
                          disabled={!isAdmin}
                          required
                        />
                        {!isRevokeAddrValid && (
                          <p className="mt-2 text-xs text-error">Enter a valid Ethereum address (0x + 40 hex chars).</p>
                        )}
                      </Field>

                      <button className="btn btn-error mt-2 w-full rounded-lg" type="submit" disabled={adminBusy || !isAdmin || !isRevokeAddrValid}>
                        {adminBusy ? <span className="loading loading-spinner loading-sm" /> : revokeValue ? `Revoke ${shortAddr(revokeValue)}` : "Revoke access"}
                      </button>
                    </form>
                  </SurfaceCard>
                </div>
              </div>
            )}

            {role === "Employer" && (
              <div className="space-y-5">
                <div className="grid gap-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(22rem,0.8fr)]">
                  <SurfaceCard accent="Issue" title="Create work record" tone="text-primary">
                    <form onSubmit={submitRecord} className="space-y-5">
                      <Field label="Worker wallet address">
                        <input
                          className={`input w-full font-mono ${!isWorkerAddrValid ? "input-error" : "input-bordered"}`}
                          placeholder="0x..."
                          value={workerAddr}
                          onChange={(e) => setWorkerAddr(e.target.value)}
                          required
                        />
                        {!isWorkerAddrValid && (
                          <p className="mt-2 text-xs text-error">Enter a valid Ethereum address (0x + 40 hex chars).</p>
                        )}
                      </Field>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <SurfaceCard accent="Rating" title="Performance rating" tone={ratingTone} compact>
                          <div className="flex items-center justify-between gap-3">
                            <span className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-base-content/50">Score</span>
                            <span className={`text-4xl font-bold tracking-tight ${ratingTone}`}>
                              {rating}
                              <span className="text-sm text-base-content/40">/10</span>
                            </span>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {Array.from({ length: 10 }, (_, index) => index + 1).map((value) => (
                              <button
                                key={value}
                                type="button"
                                onClick={() => setRating(value)}
                                className={`btn btn-sm h-9 min-w-9 rounded-lg px-2 ${
                                  value === rating ? "btn-primary" : value < rating ? "btn-primary btn-outline" : "btn-ghost"
                                }`}
                                aria-pressed={value === rating}
                                aria-label={`Set rating to ${value}`}
                              >
                                {value}
                              </button>
                            ))}
                          </div>
                        </SurfaceCard>

                        <SurfaceCard accent="Duration" title="Tenure length" tone="text-secondary" compact>
                          <Field label="Days">
                            <input
                              className={`input w-full font-mono ${!isDurationValid ? "input-error" : "input-bordered"}`}
                              type="number"
                              min="1"
                              value={durationDays}
                              onChange={(e) => setDurationDays(Number(e.target.value))}
                              required
                            />
                            {!isDurationValid && <p className="mt-2 text-xs text-error">Duration must be at least 1 day.</p>}
                          </Field>

                          <div className="rounded-box bg-base-200/80 p-4 font-mono text-xs text-base-content/60">
                            Estimated score impact: <span className="text-primary">+{estimatedImpact} pts</span>
                          </div>
                        </SurfaceCard>
                      </div>

                      <Field label="Work proof document">
                        <input
                          className="file-input file-input-bordered w-full"
                          type="file"
                          onChange={(e) => setFile(e.target.files[0])}
                          accept=".pdf,.png,.jpg,.jpeg"
                        />
                        <div className="mt-2 text-xs font-mono text-base-content/45">
                          {file ? `Selected: ${file.name}` : "PDF, PNG, JPG, or JPEG"}
                        </div>
                        {!file && <p className="mt-2 text-xs text-base-content/60">Attach a document before minting.</p>}
                      </Field>

                      <button className="btn btn-primary btn-lg mt-2 w-full rounded-lg" type="submit" disabled={busy || !isWorkerAddrValid || !isDurationValid}>
                        {busy ? <span className="loading loading-spinner loading-sm" /> : workerAddrValue ? `Mint record for ${shortAddr(workerAddrValue)}` : "Mint to blockchain"}
                      </button>
                    </form>
                  </SurfaceCard>

                  <SurfaceCard accent="Verify" title="Confirm a pending record" tone="text-base-content/70">
                    <VerifyRecordWidget contract={contract} notify={notify} onSuccess={() => fetchWorkerData(account)} />
                    <div className="alert alert-info mt-4 border border-info/20 bg-info/10 text-info-content">
                      <span className="text-sm">Verification updates the record status and refreshes the current account view.</span>
                    </div>
                  </SurfaceCard>
                </div>
              </div>
            )}

            {role === "Worker" && (
              <div className="space-y-5">
                <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
                  <div className="badge badge-outline font-mono text-xs">{account}</div>
                  <div className="stats border border-base-300/70 bg-base-100/90 shadow-lg">
                    <MetricStat
                      title="Score"
                      value={reputation ?? "—"}
                      desc="Reputation points"
                      tone={reputation !== null ? scoreToneClass(reputation) : "text-base-content/30"}
                    />
                    <MetricStat title="Records" value={workerRecords.length} desc="Blockchain proofs" tone="text-info" />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-base-content/45">Work history</div>
                  <button className="btn btn-ghost btn-sm rounded-lg" onClick={() => fetchWorkerData(account)} disabled={loadingRec}>
                    {loadingRec ? <span className="loading loading-spinner loading-xs" /> : "Refresh"}
                  </button>
                </div>

                {loadingRec ? (
                  <div className="space-y-3">
                    <div className="skeleton h-24 w-full rounded-box" />
                    <div className="skeleton h-24 w-full rounded-box" />
                  </div>
                ) : workerRecords.length === 0 ? (
                  <EmptyState
                    title="No records yet"
                    desc="This wallet has not received any proofs on-chain yet."
                    action={(
                      <button className="btn btn-sm btn-primary rounded-lg" onClick={() => fetchWorkerData(account)}>
                        Refresh records
                      </button>
                    )}
                  />
                ) : (
                  <div className="space-y-4">
                    {workerRecords.map((record) => (
                      <RecordCard key={record.id} rec={record} showEmployer />
                    ))}
                  </div>
                )}
              </div>
            )}

            {role === "Recruiter" && (
              <div className="space-y-5">
                <form onSubmit={lookupWorker} className="flex flex-col gap-3 md:flex-row">
                  <input
                    className={`input w-full flex-1 font-mono ${!isLookupAddrValid ? "input-error" : "input-bordered"}`}
                    placeholder="0x... wallet address"
                    value={lookupAddr}
                    onChange={(e) => setLookupAddr(e.target.value)}
                    required
                  />
                  <button
                    className="btn btn-secondary rounded-lg"
                    type="submit"
                    disabled={loadingLookup || !isLookupAddrValid || lookupAddrValue.length === 0}
                  >
                    {loadingLookup ? <span className="loading loading-spinner loading-sm" /> : lookupAddrValue ? `Query ${shortAddr(lookupAddrValue)}` : "Query wallet"}
                  </button>
                </form>
                {!isLookupAddrValid && (
                  <p className="text-sm text-error">Enter a valid Ethereum address (0x + 40 hex characters).</p>
                )}

                {lookupScore === null ? (
                  <EmptyState
                    title="Search a candidate"
                    desc="Enter a wallet address to inspect score and records without exposing raw document content."
                    action={
                      <button
                        type="button"
                        className="btn btn-outline btn-sm rounded-lg"
                        onClick={() => {
                          const first = account || "";
                          if (first) setLookupAddr(first);
                        }}
                        disabled={!account}
                      >
                        {account ? "Use connected wallet" : "Connect wallet to prefill"}
                      </button>
                    }
                  />
                ) : (
                  <div className="space-y-4">
                    <div className="stats border border-base-300/70 bg-base-100/90 shadow-lg">
                      <MetricStat title="Reputation" value={lookupScore} desc="On-chain score" tone={scoreToneClass(lookupScore)} />
                      <MetricStat title="Proofs" value={lookupRecords.length} desc="Issued records" tone="text-info" />
                      <MetricStat
                        title="Verified"
                        value={lookupRecords.filter((record) => record.isVerified).length}
                        desc="Confirmed entries"
                        tone="text-success"
                      />
                    </div>

                    <div className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-base-content/45">
                      Ledger snapshot for {shortAddr(lookupAddr)}
                    </div>

                    {lookupRecords.length === 0 ? (
                      <EmptyState
                        title="No records found"
                        desc="There are no proofs for this address yet."
                        action={
                          <button className="btn btn-sm btn-outline rounded-lg" onClick={() => setLookupAddr("")}>
                            Query another wallet
                          </button>
                        }
                      />
                    ) : (
                      <div className="space-y-4">
                        {lookupRecords.map((record) => (
                          <RecordCard key={record.id} rec={record} recruiterView />
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </SectionCard>
        </div>
      </div>
    </main>
  );
}

function Field({ label, children, className = "" }) {
  return (
    <label className={`form-control ${className}`}>
      <div className="label">
        <span className="label-text font-mono text-xs uppercase tracking-wider font-semibold text-base-content/70">{label}</span>
      </div>
      {children}
    </label>
  );
}

function SurfaceCard({ accent, title, tone = "text-primary", compact = false, children }) {
  return (
    <div className="card border border-base-300/70 bg-base-100/90 shadow-sm hover:shadow-md transition">
      <div className={`card-body ${compact ? "gap-3" : "gap-4"}`}>
        <div className="space-y-1">
          <div className={`font-mono text-xs uppercase tracking-wider font-semibold ${tone}`}>{accent}</div>
          <h3 className="text-xl font-bold tracking-tight">{title}</h3>
        </div>
        {children}
      </div>
    </div>
  );
}

function MetricStat({ title, value, desc, tone }) {
  return (
    <div className="stat">
      <div className="stat-title text-xs uppercase tracking-wider font-semibold">{title}</div>
      <div className={`stat-value text-2xl font-bold ${tone}`}>{value}</div>
      <div className="stat-desc text-xs">{desc}</div>
    </div>
  );
}

function EmptyState({ title, desc, action }) {
  return (
    <div className="rounded-lg border-2 border-dashed border-base-300/50 p-6 sm:p-8 text-center">
      <div className="space-y-3">
        <div className="inline-block p-3 rounded-full bg-base-200/60">
          <svg className="h-6 w-6 text-base-content/40" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
          </svg>
        </div>
        <h3 className="font-semibold text-base text-base-content">{title}</h3>
        <p className="text-sm text-base-content/60 max-w-sm mx-auto">{desc}</p>
        {action && <div className="pt-2">{action}</div>}
      </div>
    </div>
  );
}