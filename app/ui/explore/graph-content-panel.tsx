import React, { useState } from "react";
import SwitchSubTab from "./switch-tab-sub";
import UserProfileSubPanel from "@/app/ui/explore/user-profile-panel-sub";
import GraphLLMSubPanel from "@/app/ui/explore/graph-LLM-panel-sub";
export default function GraphLLMContentPanel() {
  const [activeSubPanel, setActiveSubPanel] = useState("graphLLM");

  const renderSubPanelContent = () => {
    switch (activeSubPanel) {
      case "graphLLM":
        return <GraphLLMSubPanel />;
      case "userProfile":
        return <UserProfileSubPanel />;
      default:
        return null;
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-webkit border-b border-panel-border p-6">
        {renderSubPanelContent()}
      </div>
      <SwitchSubTab
        activeSubPanel={activeSubPanel}
        setActiveSubPanel={setActiveSubPanel}
      />
    </div>
  );
}
