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
    <div className="h-full">
      <div className="flex flex-col justify-between h-full pb-0 pt-4">
        <div className="RenderPanel border-panel-border border-b-1 p-4 h-full">
          {renderSubPanelContent()}
        </div>
        <SwitchSubTab
          activeSubPanel={activeSubPanel}
          setActiveSubPanel={setActiveSubPanel}
        />
      </div>
    </div>
  );
}
