import React, { useState } from "react";
import SizeSlider from "@/app/ui/explore/button/size-slider";
import { Button } from "@nextui-org/react";
import Generate3DButton from "@/app/ui/explore/button/generate-3D-button";
import { useGenerationManager } from "@/app/lib/context/generationContext";
import { generate3DModel } from "@/app/lib/data";
import { generate3DModel_Backend } from "@/app/lib/data";
export default function SizeInputButtonGroup() {
  const { modelManager } = useGenerationManager();
  const { graphManager } = useGenerationManager();
  const currentBoxSize = modelManager.boundingBoxSize;
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate3DModel = async () => {
    setIsLoading(true);
    // try {
    //   await new Promise((resolve) => setTimeout(resolve, 2000));

    //   const modelPath = await generate3DModel(currentBoxSize);
    //   console.log("3D model generated:", modelPath);
    //   console.log(
    //     "Backend Graph Data is",
    //     graphManager.formalizeGraphIntoNodesAndEdgesForBackend()
    //   );
    //   console.log("Backend Model Size is", modelManager.boundingBoxSize);
    //   modelManager.updateModel(modelPath);
    // } catch (error) {
    //   console.error("Failed to generate 3D model:", error);
    // } finally {
    //   setIsLoading(false);
    // }
    const formalizedGraph =
      graphManager.formalizeGraphIntoNodesAndEdgesForBackend();
    const modelSize = modelManager.boundingBoxSize;
    try {
      const model = await generate3DModel_Backend(formalizedGraph, modelSize);
      console.log(
        "Backend Graph Data is",
        graphManager.formalizeGraphIntoNodesAndEdgesForBackend()
      );
      console.log("Backend Model Size is", modelManager.boundingBoxSize);
      // modelManager.updateModel(model);
    } catch (error) {
      console.error("Failed to generate 3D model:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-row gap-1 bg-transparent ">
      <div className="shadow-2xl backdrop-blur-xl rounded-tl-full flex items-center rounded-bl-full basis-1/4 grow h-12  bg-panel-bg bg-opacity-60 p-2">
        <SizeSlider
          initialValue={currentBoxSize.length}
          label="length"
          maxValue={100}
        />
      </div>
      <div className="shadow-2xl backdrop-blur-xl flex items-center basis-1/4 grow h-12 bg-panel-bg bg-opacity-60 p-2">
        <SizeSlider
          initialValue={currentBoxSize.width}
          label="width"
          maxValue={100}
        />
      </div>
      <div className="shadow-2xl backdrop-blur-xl flex items-center basis-1/4 grow h-12 bg-panel-bg bg-opacity-60 p-2">
        <SizeSlider
          initialValue={currentBoxSize.height}
          label="height"
          maxValue={3}
        />
      </div>
      <div className="flex-none">
        <Generate3DButton
          isLoading={isLoading}
          onClick={
            handleGenerate3DModel
            // console.log("Generate 3D Button Clicked");
          }
        />
      </div>
    </div>
  );
}
