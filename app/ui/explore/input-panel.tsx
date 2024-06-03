import React from "react";
import { Button } from "@nextui-org/react";

export default function InputPanel() {
  return (
    <div className="absolute top-0 left-0 w-full h-full pointer-events-none text-white">
      <div className="absolute inset-y-16 left-6 w-2/6 bg-panel-bg bg-opacity-50 border-panel-border border-1 p-4 rounded-2xl pointer-events-auto">
        <p>input panel</p>{" "}
        <Button color="primary" variant="solid">
          Button
        </Button>
        <Button color="secondary" variant="solid">
          Button
        </Button>
      </div>
    </div>
  );
}
