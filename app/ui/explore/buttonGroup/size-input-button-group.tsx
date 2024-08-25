import React, { useState } from "react";
import SizeSlider from "@/app/ui/explore/button/base-type/size-slider";
import Generate3DButton from "@/app/ui/explore/button/action-raidus-boarder-button";
import { useGenerationManager } from "@/app/lib/context/generationContext";
import { generate3DModel_Backend } from "@/app/lib/data";
import { BsBox } from "react-icons/bs";

export default function SizeInputButtonGroup() {
  const { modelManager } = useGenerationManager();
  const { graphManager } = useGenerationManager();
  const currentBoxSize = modelManager.boundingBoxSize;
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate3DModel = async () => {
    setIsLoading(true);
    const modelSize = modelManager.boundingBoxSize;
    const formalizedGraph =
      graphManager.formalizeGraphIntoNodesAndEdgesForBackend(); // 用实际的 formalizedGraph 替换

    try {
      const modelBlob = await generate3DModel_Backend(
        formalizedGraph,
        modelSize
      );
      console.log("Backend Graph Data is", formalizedGraph);
      console.log("Backend Model Size is", modelSize);

      // convert moddel to Blob object
      const objBlob = new Blob([modelBlob], { type: "model/obj" });
      modelManager.updateModel(objBlob);
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
          color="primary"
          radiusSide="right-full"
          size="lg"
          buttonText="Generate"
          icon={<BsBox />}
          iconPosition="left"
          iconSize="size-7"
        />
      </div>
    </div>
  );
}
