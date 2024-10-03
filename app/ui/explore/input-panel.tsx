"use client";

import React, { useState } from "react";
import SwitchTabMain from "@/app/ui/explore/switch-tab-main";
import GraphLLMContentPanel from "@/app/ui/explore/graph-content-panel";
import HistoryContentPanel from "@/app/ui/explore/history-content-panel";
import SizeInputButtonGroup from "@/app/ui/explore/buttonGroup/size-input-button-group";
import HistoryCollectionButtonGroup from "@/app/ui/explore/buttonGroup/history-collection-button-group";
export default function InputPanel() {
  const [activePanel, setActivePanel] = useState("graph");

  const renderPanelContent = () => {
    switch (activePanel) {
      case "graph":
        return <GraphLLMContentPanel />;
      case "history":
        return <HistoryContentPanel />;
      default:
        return null;
    }
  };

  return (
    <div className="absolute top-0 left-0 w-full h-full pointer-events-none text-white">
      <SwitchTabMain
        activePanel={activePanel}
        setActivePanel={setActivePanel}
      />
      <div className="relative w-full h-full flex flex-row items-end">
        <div className="absolute top-[88px] overflow-auto left-6 bottom-12 w-2/6 min-w-96 bg-panel-bg bg-opacity-50 border-panel-border border-1  rounded-3xl pointer-events-auto">
          {renderPanelContent()}
        </div>
        <div className="absolute bottom-12 left-1/2 transform -translate-x-2/5 w-2/5 pointer-events-auto hidden lg:block">
          <SizeInputButtonGroup />
        </div>
        <div className="absolute top-1/4 inset-y-0 right-0 z-20 pointer-events-auto">
          <HistoryCollectionButtonGroup />
        </div>
      </div>
    </div>
  );
}
