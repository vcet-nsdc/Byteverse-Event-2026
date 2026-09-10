"use client";

import { Starfield } from "@/components/ui/starfield-1";

export default function DemoOne() {
  return (
    <div className="relative flex h-screen w-full flex-col items-center justify-center overflow-hidden">
      <Starfield />
      <span className="pointer-events-none z-10 text-center text-7xl leading-none font-semibold tracking-tighter whitespace-pre-wrap text-white">
        Starfield
      </span>
    </div>
  );
}
