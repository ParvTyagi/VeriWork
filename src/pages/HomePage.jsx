import { useNavigate } from "react-router-dom";
import { useVeriWork } from "../components/VeriWorkContext";
import { SectionCard } from "../components/VeriWorkShell";

export default function HomePage() {
  const navigate = useNavigate();
  const { connectWallet } = useVeriWork();

  return (
    <main className="relative z-10 mx-auto w-full max-w-6xl flex-1 px-4 py-12 sm:py-16">
      <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
        {/* Hero Left: Value Prop + CTA */}
        <SectionCard
          eyebrow="On-chain work credentials"
          title={
            <>
              <span>Verify work.</span>
              <br className="hidden sm:block" />
              <span className="text-primary">Reveal less.</span>
            </>
          }
          subtitle="Production-grade dashboard for issuing and verifying work proofs. Employers mint, workers keep ownership, recruiters verify—all with zero document exposure."
        >
          <div className="space-y-4">
            <button 
              className="btn btn-primary btn-lg w-full rounded-lg shadow-lg shadow-primary/20 transition hover:shadow-primary/30" 
              onClick={() => connectWallet(true, navigate)}
            >
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M11.3 1.046A1 1 0 0010 2v4H6a1 1 0 00-.894.553l-4 8A1 1 0 002 16h5v3a1 1 0 001.79.61l6-8A1 1 0 0014 10h-4l.8-7.954a1 1 0 00-.768-1.054z" />
              </svg>
              Connect MetaMask to Begin
            </button>

            <div className="rounded-lg border border-success/30 bg-success/10 px-4 py-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-success">
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-success" aria-hidden="true" />
                Sepolia testnet ready
              </div>
              <p className="mt-1 text-xs text-base-content/65">
                IPFS-backed records and on-chain verification are enabled after wallet connection.
              </p>
            </div>

            <div className="flex gap-2 pt-1">
              <a className="btn btn-outline btn-sm flex-1 rounded-lg" href="https://github.com" target="_blank" rel="noreferrer">
                <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
                </svg>
                Docs
              </a>
              <a className="btn btn-outline btn-sm flex-1 rounded-lg" href="https://github.com" target="_blank" rel="noreferrer">
                <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                </svg>
                Live Demo
              </a>
            </div>
          </div>
        </SectionCard>

        {/* Hero Right: Onboarding */}
        <SectionCard
          eyebrow="Getting started"
          title="Three-step setup"
          subtitle="Get wallet connected and choose your role immediately."
        >
          <div className="space-y-4">
            <ul className="steps steps-vertical w-full">
              <li className="step step-primary text-sm sm:text-base">
                <span>
                  <span className="font-semibold">Connect Wallet</span>
                  <div className="text-xs text-base-content/60 mt-1">MetaMask required for Sepolia</div>
                </span>
              </li>
              <li className="step step-primary text-sm sm:text-base">
                <span>
                  <span className="font-semibold">Verify Network</span>
                  <div className="text-xs text-base-content/60 mt-1">Auto-switch to Sepolia testnet</div>
                </span>
              </li>
              <li className="step text-sm sm:text-base">
                <span>
                  <span className="font-semibold">Pick Your Role</span>
                  <div className="text-xs text-base-content/60 mt-1">Admin, Employer, Worker, or Recruiter</div>
                </span>
              </li>
            </ul>

            <div className="rounded-lg border border-base-300/50 bg-base-200/40 p-4">
              <div className="font-mono text-xs uppercase tracking-wider text-base-content/60 mb-3">Available roles</div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Employer</span>
                  <span className="text-primary font-semibold">Issue proofs</span>
                </div>
                <div className="flex justify-between">
                  <span>Worker</span>
                  <span className="text-info font-semibold">View records</span>
                </div>
                <div className="flex justify-between">
                  <span>Recruiter</span>
                  <span className="text-secondary font-semibold">Verify talent</span>
                </div>
              </div>
            </div>
          </div>
        </SectionCard>
      </div>
    </main>
  );
}
