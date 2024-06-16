"use client";

import React from "react";
import UserButton from "@/app/ui/explore/button/user-button";
import HistoryButton from "@/app/ui/explore/button/history-button";
import GraphButton from "@/app/ui/explore/button/graph-button";

interface SwitchTabProps {
  activePanel: string;
  setActivePanel: (panel: string) => void;
}

export default function SwitchTab({
  activePanel,
  setActivePanel,
}: SwitchTabProps) {
  return (
    <div className="absolute top-5 w-2/6 left-6 h-16 min-w-96 bg-panel-bg bg-opacity-50 border-panel-border border-1 p-3 rounded-full pointer-events-auto flex items-center justify-between">
      <div className="shadow-2xl rounded-full backdrop-blur-xl flex items-center">
        <UserButton
          isActive={activePanel === "user"}
          onClick={() => setActivePanel("user")}
          borderWidth={1.5}
        />
      </div>
      <div className="shadow-2xl backdrop-blur-xl flex items-center space-x-3 border-1 border-panel-border rounded-full p-2">
        <HistoryButton
          isActive={activePanel === "history"}
          onClick={() => setActivePanel("history")}
          borderWidth={0}
        />
        <GraphButton
          isActive={activePanel === "graph"}
          onClick={() => setActivePanel("graph")}
          borderWidth={0}
        />
      </div>
    </div>
  );
}
