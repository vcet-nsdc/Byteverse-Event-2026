"use client";
import { useEffect } from "react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-bv-deep flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="font-pirate text-4xl text-bv-gold">Shipwreck!</div>
        <p className="text-muted-foreground">Something went wrong on our end.</p>
        <button
          onClick={reset}
          className="px-6 py-2 bg-bv-gold text-bv-deep font-bold rounded"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
