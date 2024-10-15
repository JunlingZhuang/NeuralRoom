"use client";

import ShimmerButton from "@/components/ui/shimmer-button";
import { links } from "@/app/ui/nav";

export function Hero() {
  const handleJumpToExplore = () => {
    const exploreLink = links.find((link) => link.name === "Explore")?.href;
    if (exploreLink) {
      window.location.href = exploreLink;
    }
  };
  return (
    <div className="z-10 p-[5vw] flex-row min-h-64 items-center justify-center gap-y-80">
      <div className="hero-container flex flex-col gap-y-20">
        <div className="text-2xl text-center font-light">
          Utilizing natural language processing (NLP) to and Graph Neural
          Network(GNN) to help non-professional users design their own dream
          rooms by Integration AI and graph theory into the 3D scene design
          process
        </div>
        <div className="shimmer-button-container flex justify-center">
          <ShimmerButton onClick={handleJumpToExplore} className="shadow-2xl">
            <span className="whitespace-pre-wrap text-center text-2xl font-normal leading-none tracking-tight text-white dark:from-white dark:to-slate-900/10 lg:text-2xl">
              Explore
            </span>
          </ShimmerButton>
        </div>
      </div>
    </div>
  );
}
