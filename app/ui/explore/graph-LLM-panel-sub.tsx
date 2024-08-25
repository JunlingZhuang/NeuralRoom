import React, { useState } from "react";
import { Textarea } from "@nextui-org/react";
import GraphLLMButtonGroup from "@/app/ui/explore/buttonGroup/input-panel-button-group";
import { PiGraphLight } from "react-icons/pi";
import { RiRestartLine } from "react-icons/ri";
import GraphCanvas from "@/app/ui/explore/graph-canvas";
import { useGenerationManager } from "@/app/lib/context/generationContext";
import { generateGraph_Backend } from "@/app/lib/data";
import { Graph } from "@/app/lib/manager/graphManager";

export default function GraphLLMSubPanel() {
  const [primaryPrompt, setPrimaryPrompt] = useState("");
  const { graphManager } = useGenerationManager();
  const [isLoading, setIsLoading] = useState(false);

  const handleRestart = () => {
    console.log("Click on Restart");
  };

  const handleTextareaChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setPrimaryPrompt(e.target.value);
  };

  const handleGenerateGraph = async () => {
    setIsLoading(true);
    console.log("Textarea content:", primaryPrompt);
    try {
      const rawGraphData = await generateGraph_Backend(primaryPrompt);
      const newGraph: Graph = await graphManager.handleGeneratedGraphData(
        rawGraphData
      );

      graphManager.updateGraph(newGraph);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
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
          value={primaryPrompt}
          onChange={handleTextareaChange} // Capture input changes
        />
      </div>
      <GraphLLMButtonGroup
        isLoading={isLoading}
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
