import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <main className="mx-auto flex min-h-[60vh] w-full max-w-4xl items-center justify-center px-4 py-16">
      <div className="card border border-base-300/70 bg-base-100/90 shadow-xl w-full max-w-md">
        <div className="card-body text-center gap-5">
          <div className="text-5xl font-bold text-primary">404</div>
          <h1 className="text-2xl font-bold tracking-tight">Page not found</h1>
          <p className="text-base-content/60">The route you requested does not exist. Return home to get back on track.</p>
          <div className="card-actions justify-center pt-2">
            <Link className="btn btn-primary rounded-lg" to="/">
              <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
              </svg>
              Go home
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
