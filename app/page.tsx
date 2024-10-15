"use client";
import { RetroGrid } from "@/app/ui/retro-grid";
import { Hero } from "@/app/ui/hero";
export default function Home() {
  return (
    <main className="flex flex-col items-center justify-between p-24">
      <Hero />
      <RetroGrid />
    </main>
  );
}
