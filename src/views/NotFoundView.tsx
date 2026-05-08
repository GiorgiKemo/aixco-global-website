import Link from "next/link";

const NotFound = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <div className="glass rounded-lg p-10 text-center">
        <h1 className="mb-4 text-4xl font-bold">404</h1>
        <p className="mb-4 text-xl text-muted-foreground">Oops! Page not found</p>
        <Link href="/" className="btn-ghost-gold">
          Return to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
