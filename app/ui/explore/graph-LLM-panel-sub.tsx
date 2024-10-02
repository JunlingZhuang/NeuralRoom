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
  const { graphManager, getSamplePrompts } = useGenerationManager();
  const [isLoading, setIsLoading] = useState(false);
  const [isInvalid, setIsInvalid] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleRestart = () => {
    setPrimaryPrompt("");
    console.log("Click on Restart");
  };

  const handleTextareaChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setPrimaryPrompt(e.target.value);
    setIsInvalid(false); // Reset isInvalid when user starts typing
  };

  const handleGenerateGraph = async () => {
    if (!primaryPrompt) {
      setErrorMessage("The description input is empty.");
      setIsInvalid(true);
      return;
    }
    setIsLoading(true);
    console.log("Textarea content:", primaryPrompt);

    try {
      const rawGraphData = await generateGraph_Backend(primaryPrompt);
      const newGraph: Graph = await graphManager.handleGeneratedGraphData(
        rawGraphData
      );

      if (newGraph.Nodes.length !== 0 && newGraph.Edges.length !== 0) {
        graphManager.updateGraph(newGraph);
      } else {
        setIsInvalid(true);
        setErrorMessage("Please input a valid prompt.");
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRandomBtnClick = async () => {
    setIsInvalid(false); // Reset isInvalid when user starts typing
    console.log("Click on Random input");
    const samplePrompts = await getSamplePrompts();
    setPrimaryPrompt(
      samplePrompts[Math.floor(Math.random() * samplePrompts.length)]
    );
  };

  return (
    <div className="flex flex-col h-full space-y-5 w-full max-w-full justify-between">
      <div className="graphLLMContaniner flex-col space-y-5">
        <div className="flex text-lg justify-center">Graph</div>
        <GraphCanvas />
        <Textarea
          isInvalid={isInvalid}
          key="bordered"
          size="lg"
          variant="bordered"
          label="Primary Prompt"
          labelPlacement="inside"
          placeholder="Describe some social relationships that would matter in the design"
          errorMessage={errorMessage}
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
        randomButtonOnClick={handleRandomBtnClick}
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
