import React from "react";
interface SwitchSubTabProps {
  activeSubPanel: string;
  setActiveSubPanel: (subPanel: string) => void;
}

export default function SwitchSubTab({
  activeSubPanel,
  setActiveSubPanel,
}: SwitchSubTabProps) {
  return (
    <div className="panelSwitchControler flex flex-row px-4 pb-0 items-end h-14 space-x-3">
      <button
        className={`GraphSwitchButton flex flex-col pl-2 items-center ${
          activeSubPanel === "graphLLM" ? "text-white" : "text-gray-500"
        }`}
        onClick={() => setActiveSubPanel("graphLLM")}
      >
        <div>Graph</div>
        <div
          className={`w-24 h-1 rounded-t-2xl ${
            activeSubPanel === "graphLLM" ? "bg-main-blue" : "bg-transparent"
          }`}
        ></div>
      </button>
      <button
        className={`GraphSwitchButton flex flex-col items-center ${
          activeSubPanel === "userProfile" ? "text-white" : "text-gray-500"
        }`}
        onClick={() => setActiveSubPanel("userProfile")}
      >
        <div>User Profile</div>
        <div
          className={`w-24 h-1 rounded-t-2xl ${
            activeSubPanel === "userProfile" ? "bg-main-blue" : "bg-transparent"
          }`}
        ></div>
      </button>
    </div>
  );
}
