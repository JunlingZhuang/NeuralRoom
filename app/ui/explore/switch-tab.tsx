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
    <div className="absolute top-5 w-2/6 left-6 h-16 bg-panel-bg bg-opacity-50 border-panel-border border-1 p-5 rounded-3xl pointer-events-auto flex items-center justify-between">
      <div className="flex items-center">
        <UserButton
          isActive={activePanel === "user"}
          onClick={() => setActivePanel("user")}
        />
      </div>
      <div className="flex items-center space-x-2">
        <HistoryButton
          isActive={activePanel === "history"}
          onClick={() => setActivePanel("history")}
        />
        <GraphButton
          isActive={activePanel === "graph"}
          onClick={() => setActivePanel("graph")}
        />
      </div>
    </div>
  );
}
