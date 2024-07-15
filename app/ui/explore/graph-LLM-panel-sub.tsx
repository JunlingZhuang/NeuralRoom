import React, { useState } from "react";

export default function GraphLLMSubPanel() {
  return (
    <div className="flex flex-col space-y-5 w-full max-w-full  overflow-auto">
      <div className="flex text-lg justify-center">Graph</div>
      <div className="flex justify-center">GraphCanvas</div>
      <div className="flex justify-center">LLM Input</div>
    </div>
  );
}
