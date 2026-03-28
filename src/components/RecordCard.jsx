import { memo } from "react";

const IPFS_GATEWAY = "https://gateway.pinata.cloud/ipfs/";
const shortAddr = (a) => `${a.slice(0, 6)}…${a.slice(-4)}`;

function RecordCard({ rec, showEmployer = false, recruiterView = false }) {
  const date = rec.timestamp
    ? new Date(rec.timestamp * 1000).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : null;

  const months = Math.floor(rec.durationDays / 30);
  const scoreToneClass = rec.rating >= 8 ? "text-success" : rec.rating >= 5 ? "text-info" : "text-warning";
  const statusToneClass = rec.isVerified ? "badge-success" : "badge-warning";
  const statusText = rec.isVerified ? "Verified" : "Pending verification";

  return (
    <article
      className="card border border-base-300/70 bg-base-100/95 shadow-lg transition duration-200 hover:-translate-y-1 hover:shadow-xl fade-up"
      style={{ animationDelay: `${rec.id * 0.05}s` }}
    >
      <div className="card-body gap-4 p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-base">Record #{String(rec.id).padStart(4, "0")}</h3>
              {date && <span className="text-[0.75rem] font-mono text-base-content/50">{date}</span>}
            </div>
            {showEmployer && (
              <div className="text-xs text-info font-mono">
                Issuer: {shortAddr(rec.employer)}
              </div>
            )}
          </div>

          <div className={`badge gap-1.5 px-3 py-2 font-semibold text-[0.75rem] ${statusToneClass}`}>
            {rec.isVerified ? (
              <>
                <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                {statusText}
              </>
            ) : (
              <>
                <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10A8 8 0 11.001 9.997 8 8 0 0118 10zM9 5a1 1 0 012 0v4a1 1 0 11-2 0V5zm1 8a1.25 1.25 0 100 2.5A1.25 1.25 0 0010 13z" clipRule="evenodd" />
                </svg>
                {statusText}
              </>
            )}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-base-300/60 bg-base-200/40 p-3">
            <div className="text-xs font-mono uppercase tracking-wider text-base-content/50 mb-2">Performance</div>
            <div className="flex items-baseline gap-2">
              <span className={`text-3xl font-bold leading-none ${scoreToneClass}`}>{rec.rating}</span>
              <span className="text-xs text-base-content/60 font-mono">/10</span>
            </div>
            <div className="mt-2 text-[0.72rem] text-base-content/60">
              {rec.rating >= 8 ? "✓ Strong" : rec.rating >= 5 ? "◐ Solid" : "○ Needs review"}
            </div>
          </div>

          <div className="rounded-lg border border-base-300/60 bg-base-200/40 p-3">
            <div className="text-xs font-mono uppercase tracking-wider text-base-content/50 mb-2">Tenure</div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold leading-none text-secondary">{rec.durationDays}</span>
              <span className="text-xs text-base-content/60 font-mono">days</span>
            </div>
            <div className="mt-2 text-[0.72rem] text-base-content/60">
              {months > 0 ? `${months} month${months !== 1 ? "s" : ""}` : "Less than 1 month"}
            </div>
          </div>
        </div>

        {!recruiterView && rec.ipfsHash && (
          <a
            className="btn btn-outline btn-sm w-full rounded-lg gap-2 font-mono text-xs"
            href={`${IPFS_GATEWAY}${rec.ipfsHash}`}
            target="_blank"
            rel="noreferrer"
            title="View proof document on IPFS"
          >
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
            </svg>
            <span className="truncate">View proof: {rec.ipfsHash.slice(0, 16)}…</span>
            <svg className="h-3.5 w-3.5 ml-auto opacity-60" viewBox="0 0 20 20" fill="currentColor">
              <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
            </svg>
          </a>
        )}

        {recruiterView && (
          <div className="text-[0.7rem] text-base-content/50 italic pt-2 border-t border-base-300/50">
            Recruiter verification view — sensitive data redacted
          </div>
        )}
      </div>
    </article>
  );
}

function DataCell({ label, children, className = "" }) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <span className="font-mono text-[0.55rem] uppercase tracking-[0.14em] text-base-content/40">{label}</span>
      {children}
    </div>
  );
}

export default memo(RecordCard);