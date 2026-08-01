import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-8rem)] px-4">
      <div className="glass p-8 sm:p-12 max-w-md w-full text-center space-y-6">
        <div className="space-y-2">
          <h1 className="text-6xl font-bold text-accent">404</h1>
          <h2 className="text-xl font-semibold text-foreground">
            Page not found
          </h2>
          <p className="text-foreground/70 text-sm">
            The page you are looking for doesn&apos;t exist or has been moved.
          </p>
        </div>
        <Link
          href="/"
          className="inline-flex items-center justify-center px-6 py-3 text-sm font-medium rounded-theme bg-accent text-secondary hover:brightness-110 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent/50"
        >
          Return to Home
        </Link>
      </div>
    </div>
  );
}
