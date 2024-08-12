import React from "react";
import { Textarea } from "@nextui-org/react";
import UserProfileButtonGroup from "@/app/ui/explore/buttonGroup/input-panel-button-group";
import { PiGraphLight } from "react-icons/pi";
import { RiRestartLine } from "react-icons/ri";
import GraphCanvas from "@/app/ui/explore/graph-canvas";
export default function GraphLLMSubPanel() {
  const handleRestart = () => {
    console.log("Click on Restart");
  };
  const handleGenerateGraph = () => {
    console.log("Click on Generate Graph");
  };
  return (
    <div className="flex flex-col h-full space-y-5 w-full max-w-full justify-between">
      <div className="graphLLMContaniner flex-col space-y-5">
        <div className="flex text-lg justify-center">Graph</div>
        <GraphCanvas />
        <Textarea
          isInvalid={false}
          key="bordered"
          size="lg"
          variant="bordered"
          label="Primary Prompt"
          labelPlacement="inside"
          placeholder="Describe some social relationships that would matter in the design"
          errorMessage="The description should be at least 255 characters long."
          classNames={{
            base: "w-full",
            input: "resize-y min-h-[120px] max-h-[120px]",
          }}
        />
      </div>
      <UserProfileButtonGroup
        isRandomButtonVisible={true}
        LeftContentButtonLabel="Restart"
        LeftContentButtonOnClick={handleRestart}
        LeftContentButtonIcon={<RiRestartLine />}
        RightContentButtonLabel="See Graph"
        RightContentButtonOnClick={handleGenerateGraph}
        RightContentButtonIcon={<PiGraphLight />}
      />
    </div>
  );
}
