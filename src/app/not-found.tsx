import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-bv-deep flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="font-pirate text-4xl text-bv-gold">404 — Lost at Sea</div>
        <p className="text-muted-foreground">This page has drifted off the map.</p>
        <Link href="/" className="inline-block px-6 py-2 bg-bv-gold text-bv-deep font-bold rounded">
          Return to Port
        </Link>
      </div>
    </div>
  );
}
