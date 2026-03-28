import { NavLink } from "react-router-dom";

import brandMark from "../assets/veriwork-mark.svg";

export const TABS = [
  { id: "Admin", label: "Admin", path: "/admin" },
  { id: "Employer", label: "Employer", path: "/employer" },
  { id: "Worker", label: "Worker", path: "/worker" },
  { id: "Recruiter", label: "Recruiter", path: "/recruiter" },
];

export const TAB_BY_PATH = Object.fromEntries(TABS.map((tab) => [tab.path, tab.id]));

export function shortAddr(address = "") {
  if (!address) return "—";
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

export function scoreToneClass(score) {
  if (score >= 200) return "text-success";
  if (score >= 100) return "text-info";
  return "text-warning";
}

export function SectionCard({ eyebrow, title, subtitle, children, className = "" }) {
  return (
    <section className={`card border border-base-300/70 bg-base-100/90 shadow-xl backdrop-blur ${className}`}>
      <div className="card-body gap-5 p-5 sm:p-6 lg:p-7">
        {(eyebrow || title || subtitle) && (
          <div className="space-y-1">
            {eyebrow && <div className="font-mono text-[0.65rem] uppercase tracking-[0.22em] text-primary">{eyebrow}</div>}
            {title && <h2 className="card-title text-2xl sm:text-3xl tracking-tight">{title}</h2>}
            {subtitle && <p className="max-w-2xl text-sm leading-6 text-base-content/65">{subtitle}</p>}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}

export function AppShell({
  account,
  isAdmin,
  onConnect,
  onDisconnect,
  themeToggle,
  wrongNetwork,
  onSwitchNetwork,
  toast,
  children,
}) {
  return (
    <div className="app-grid min-h-screen bg-base-200 text-base-content">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="bg-sheen" />
        <div className="bg-orb bg-orb-a -left-24 top-10 h-72 w-72" />
        <div className="bg-orb bg-orb-b -right-20 top-1/4 h-80 w-80" />
        <div className="bg-orb bg-orb-c bottom-0 left-1/3 h-64 w-64" />
      </div>

      <div className="navbar sticky top-0 z-30 border-b border-base-300/70 bg-base-100/85 px-3 py-2 sm:px-6 shadow-lg backdrop-blur-xl">
        {/* Logo and Brand */}
        <div className="navbar-start">
          <NavLink to="/" end className="flex items-center gap-2 rounded-lg px-2 py-1 transition hover:bg-base-200/70">
            <img src={brandMark} alt="VeriWork logo" className="h-9 w-9 shrink-0" loading="eager" decoding="async" />
            <div className="hidden sm:block">
              <div className="text-base font-bold tracking-tight">VeriWork</div>
              <div className="font-mono text-[0.55rem] uppercase tracking-wider text-base-content/50">Blockchain Verified</div>
            </div>
          </NavLink>
        </div>

        {/* Desktop Navigation */}
        <div className="navbar-center hidden lg:flex">
          <ul className="menu menu-horizontal gap-1 font-mono text-xs uppercase tracking-wider">
            <li>
              <NavLink to="/" end className={({ isActive }) => `rounded-lg px-3 py-2 transition ${isActive ? "bg-primary text-primary-content" : "hover:bg-base-200/70"}`}>
                Home
              </NavLink>
            </li>
            {TABS.map((tab) => (
              <li key={tab.id}>
                <NavLink to={tab.path} className={({ isActive }) => `rounded-lg px-3 py-2 transition ${isActive ? "bg-primary text-primary-content" : "hover:bg-base-200/70"}`}>
                  {tab.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>

        {/* Mobile Menu */}
        <div className="navbar-center lg:hidden">
          <div className="dropdown dropdown-end">
            <button tabIndex={0} className="btn btn-ghost btn-sm rounded-lg font-mono text-xs uppercase tracking-wider">
              ☰ Menu
            </button>
            <ul tabIndex={0} className="menu dropdown-content z-[1] mt-3 w-48 rounded-lg border border-base-300 bg-base-100 p-2 font-mono text-xs uppercase tracking-wider shadow-xl">
              <li>
                <NavLink to="/" end>
                  Home
                </NavLink>
              </li>
              {TABS.map((tab) => (
                <li key={tab.id}>
                  <NavLink to={tab.path}>
                    {tab.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right Side - Wallet & Theme */}
        <div className="navbar-end gap-2 sm:gap-4">
          {/* Theme Toggle */}
          <div className="hidden sm:flex">{themeToggle}</div>

          {/* Wallet Connection */}
          {account ? (
            <div className="flex items-center gap-2 sm:gap-2.5">
              {!wrongNetwork && (
                <div className="hidden md:inline-flex badge badge-success badge-outline font-mono text-[0.62rem] px-2 py-1">
                  Sepolia
                </div>
              )}
              {isAdmin && (
                <div className="badge badge-primary badge-outline text-[0.62rem] font-mono px-2 py-1">
                  Admin
                </div>
              )}
              <div className="hidden sm:block badge badge-ghost font-mono text-[0.7rem] px-2 py-1">
                {shortAddr(account)}
              </div>
              <button 
                className="btn btn-outline btn-sm rounded-lg gap-1" 
                onClick={onDisconnect}
                title="Disconnect wallet"
              >
                <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 4a2 2 0 012-2h5a2 2 0 012 2v2a1 1 0 102 0V4a4 4 0 00-4-4H5a4 4 0 00-4 4v12a4 4 0 004 4h5a4 4 0 004-4v-2a1 1 0 10-2 0v2a2 2 0 01-2 2H5a2 2 0 01-2-2V4zm11.293 4.293a1 1 0 011.414 0L19 11.586a1 1 0 010 1.414l-3.293 3.293a1 1 0 01-1.414-1.414L15.586 13H9a1 1 0 110-2h6.586l-1.293-1.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                <span className="hidden sm:inline text-xs">Disconnect</span>
              </button>
            </div>
          ) : (
            <button 
              className="btn btn-primary btn-sm rounded-lg gap-2 shadow-lg shadow-primary/20 transition hover:shadow-primary/30" 
              onClick={onConnect}
            >
              <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path d="M11.3 1.046A1 1 0 0010 2v4H6a1 1 0 00-.894.553l-4 8A1 1 0 002 16h5v3a1 1 0 001.79.61l6-8A1 1 0 0014 10h-4l.8-7.954a1 1 0 00-.768-1.054z" />
              </svg>
              <span className="hidden sm:inline text-xs">Connect Wallet</span>
              <span className="sm:hidden text-xs">Connect</span>
            </button>
          )}

          {/* Mobile theme toggle */}
          <div className="sm:hidden">{themeToggle}</div>
        </div>
      </div>

      {wrongNetwork && (
        <div className="mx-auto w-full max-w-7xl px-4 pt-4">
          <div className="alert alert-warning shadow-lg">
            <span>Sepolia Testnet is required. Switch networks to continue.</span>
            <button className="btn btn-sm btn-outline rounded-full" onClick={onSwitchNetwork}>
              Switch
            </button>
          </div>
        </div>
      )}

      {toast.msg && (
        <div className="toast toast-end z-50">
          <div className={`alert shadow-lg ${toast.type === "success" ? "alert-success" : toast.type === "error" ? "alert-error" : "alert-info"}`}>
            <span>{toast.msg}</span>
          </div>
        </div>
      )}

      {children}
    </div>
  );
}
