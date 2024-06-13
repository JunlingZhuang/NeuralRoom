"use client";

import React, { useState } from "react";
import SwitchTab from "@/app/ui/explore/switch-tab";
import GraphContentPanel from "@/app/ui/explore/graph-content-panel";
import HistoryContentPanel from "@/app/ui/explore/history-content-panel";
import UserProfilePanel from "@/app/ui/explore/user-profile-panel";

export default function InputPanel() {
  const [activePanel, setActivePanel] = useState("graph");

  const renderPanelContent = () => {
    switch (activePanel) {
      case "user":
        return <UserProfilePanel />;
      case "graph":
        return <GraphContentPanel />;
      // 添加更多case以处理其他图标的内容
      case "history":
        return <HistoryContentPanel />;
    }
  };

  return (
    <div className="absolute top-0 left-0 w-full h-full pointer-events-none text-white">
      <SwitchTab activePanel={activePanel} setActivePanel={setActivePanel} />
      {/* <div className="absolute top-5 w-2/6 left-6 h-14 bg-panel-bg bg-opacity-50 border-panel-border border-1 p-4 rounded-3xl pointer-events-auto"></div> */}
      <div className="absolute top-[88px] left-6 w-2/6 h-4/5 bg-panel-bg bg-opacity-50 border-panel-border border-1 p-4 rounded-3xl pointer-events-auto">
        {renderPanelContent()}
      </div>
    </div>
  );
}
