import React from "react";

const IPFS_GATEWAY = "https://gateway.pinata.cloud/ipfs/";
const shortAddr = (a) => `${a.slice(0, 6)}...${a.slice(-4)}`;

export default function RecordCard({ rec, showEmployer = false, recruiterView = false }) {
  const date = rec.timestamp
    ? new Date(rec.timestamp * 1000).toLocaleDateString("en-IN", {
        day: "2-digit", month: "short", year: "numeric",
      })
    : null;

  const months = Math.floor(rec.durationDays / 30);

  // Dynamic styling based on rating
  const ratingColor =
    rec.rating >= 8 ? "text-success bg-success" :
    rec.rating >= 5 ? "text-primary bg-primary" :
    "text-warning bg-warning";

  return (
    <div className="group relative bg-base-100/60 backdrop-blur-md border border-base-content/10 rounded-2xl p-5 mb-4 hover:shadow-xl hover:shadow-base-300/50 hover:-translate-y-1 transition-all duration-300 overflow-hidden">
      
      {/* Subtle background glow based on verification status */}
      <div className={`absolute -right-10 -top-10 w-32 h-32 rounded-full blur-[50px] opacity-20 pointer-events-none transition-colors ${rec.isVerified ? 'bg-success' : 'bg-warning'}`} />

      {/* ── TOP ROW: ID & Status ── */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-base-content/5 relative z-10">
        <div className="flex items-center gap-3">
          <span className="bg-base-200/80 px-2.5 py-1 rounded-md text-xs font-mono font-bold text-base-content/60 shadow-inner">
            #{rec.id}
          </span>
          {date && (
            <span className="text-xs font-semibold text-base-content/40 tracking-wide">
              {date}
            </span>
          )}
        </div>

        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold shadow-sm border ${
          rec.isVerified 
            ? "bg-success/10 text-success border-success/20" 
            : "bg-warning/10 text-warning border-warning/20"
        }`}>
          {rec.isVerified ? (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
              Verified
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" /></svg>
              Pending Verification
            </>
          )}
        </div>
      </div>

      {/* ── DATA GRID ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 relative z-10">
        {showEmployer && (
          <Stat label="Issuer (Employer)">
            <span className="font-mono text-sm font-semibold bg-base-200/50 px-2 py-0.5 rounded text-base-content/80">
              {shortAddr(rec.employer)}
            </span>
          </Stat>
        )}

        <Stat label="Duration">
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-extrabold text-base-content/80 tracking-tight">{rec.durationDays}</span>
            <span className="text-xs font-bold text-base-content/40 uppercase tracking-widest">Days</span>
            <span className="text-xs font-medium text-base-content/40 ml-1">({months} mo)</span>
          </div>
        </Stat>

        <Stat label="Performance Rating" className={showEmployer ? "col-span-2 sm:col-span-1" : ""}>
          <div className="flex items-center gap-3">
            <div className="flex items-baseline gap-0.5">
              <span className={`text-xl font-extrabold ${ratingColor.split(" ")[0]}`}>{rec.rating}</span>
              <span className="text-xs font-bold text-base-content/30">/10</span>
            </div>
            {/* Custom styled progress bar */}
            <div className="h-2 w-full max-w-[80px] bg-base-300/50 rounded-full overflow-hidden shadow-inner flex-1">
              <div 
                className={`h-full rounded-full transition-all duration-1000 ease-out ${ratingColor.split(" ")[1]}`} 
                style={{ width: `${(rec.rating / 10) * 100}%` }}
              />
            </div>
          </div>
        </Stat>
      </div>

      {/* ── DOCUMENT LINK (Hidden from Recruiters) ── */}
      {!recruiterView && rec.ipfsHash && (
        <div className="mt-4 pt-3 border-t border-base-content/5 relative z-10">
          <div className="flex flex-col gap-1">
            <span className="text-[0.65rem] font-extrabold uppercase tracking-widest text-base-content/40">Cryptographic Proof</span>
            <a
              href={`${IPFS_GATEWAY}${rec.ipfsHash}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 font-mono text-xs font-medium text-secondary hover:text-secondary-focus transition-colors bg-secondary/5 hover:bg-secondary/10 px-3 py-2 rounded-lg border border-secondary/10 w-fit group/link"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 opacity-70 group-hover/link:opacity-100 transition-opacity" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" /></svg>
              {rec.ipfsHash.slice(0, 24)}...{rec.ipfsHash.slice(-6)}
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 opacity-50 group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5 transition-transform" viewBox="0 0 20 20" fill="currentColor"><path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" /><path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" /></svg>
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

// Upgraded Stat Wrapper
function Stat({ label, children, className = "" }) {
  return (
    <div className={`flex flex-col gap-1.5 bg-base-200/30 p-3 rounded-xl border border-base-content/5 ${className}`}>
      <span className="text-[0.65rem] font-extrabold uppercase tracking-widest text-base-content/40">
        {label}
      </span>
      {children}
    </div>
  );
}