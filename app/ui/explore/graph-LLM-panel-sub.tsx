import React , { useState }from "react";
import { Textarea } from "@nextui-org/react";
import GraphLLMButtonGroup from "@/app/ui/explore/buttonGroup/input-panel-button-group";
import { PiGraphLight } from "react-icons/pi";
import { RiRestartLine } from "react-icons/ri";
import GraphCanvas from "@/app/ui/explore/graph-canvas";
import { useGenerationManager } from "@/app/lib/context/generationContext";

export default function GraphLLMSubPanel() {
  const [textareaValue, setTextareaValue] = useState("");
  const { graphManager } = useGenerationManager();
  const handleRestart = () => {
    console.log("Click on Restart");
  };
  const handleTextareaChange = (e) => {
    setTextareaValue(e.target.value);
  };
  const handleGenerateGraph = async ()  => {
    console.log("Textarea content:", textareaValue);
    try {
      const response = await fetch('/api/text2graph', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: textareaValue }), // Sending the textarea value as JSON
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Backend graph:", data);
        // Use fetchLLMGraphData to process the received data and update the graph
        await graphManager.fetchLLMGraphData(data);

      } else {
        console.error("Failed to send data to the backend.");
      }
    } catch (error) {
      console.error("Error:", error);
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
          value={textareaValue}
          onChange={handleTextareaChange} // Capture input changes
        />
      </div>
      <GraphLLMButtonGroup
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
