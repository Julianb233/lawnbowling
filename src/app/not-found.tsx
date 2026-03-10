import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-animated-gradient px-4">
      <div className="text-center">
        <div className="text-8xl mb-4">{"\uD83C\uDFD3"}</div>
        <h1 className="text-6xl font-black text-zinc-100 mb-2">404</h1>
        <h2 className="text-xl font-semibold text-zinc-300 mb-4">
          Out of Bounds!
        </h2>
        <p className="text-zinc-500 mb-8 max-w-sm mx-auto">
          Looks like this shot went wide. The page you&apos;re looking for
          doesn&apos;t exist or has been moved.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            href="/board"
            className="rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 px-6 py-3 text-sm font-bold text-white shadow-lg hover:shadow-xl transition-all"
          >
            Back to the Board
          </Link>
          <Link
            href="/"
            className="rounded-xl border border-zinc-700 px-6 py-3 text-sm font-medium text-zinc-300 hover:bg-zinc-800 transition-all"
          >
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}
