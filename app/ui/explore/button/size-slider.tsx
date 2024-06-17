import React, { useState } from "react";
import { Slider } from "@nextui-org/react";
import { useGenerationManager } from "@/app/lib/context/generationContext";
import { BoundingBoxSize } from "@/app/lib/definition/general-definition";

interface SizeSliderProps {
  maxValue?: number;
  initialValue?: number;
  label: "length" | "width" | "height";
}

const SizeSlider: React.FC<SizeSliderProps> = ({
  maxValue = 100,
  initialValue = 60,
  label,
}) => {
  const [sliderValue, setSliderValue] = useState<number>(initialValue);
  const { modelManager } = useGenerationManager();

  const handleChange = (sliderValue: number | number[]) => {
    if (typeof sliderValue !== "number") return;
    setSliderValue(sliderValue);
    const newBoundingBoxSize = { [label]: sliderValue };
    modelManager.updateBoundingBoxSize(newBoundingBoxSize as BoundingBoxSize);
    modelManager.updateModel(null); // Set model to null to trigger box rendering
    console.log("Updated box size:", modelManager.boundingBoxSize); // Add a console log to verify updates
  };

  return (
    <div className="flex flex-row items-center gap-4 w-full max-w-md">
      <div className="text-sm">{label}</div>
      <Slider
        showTooltip={true}
        size="sm"
        defaultValue={initialValue}
        maxValue={maxValue}
        minValue={0}
        step={1}
        classNames={{
          base: "max-w-md gap-3",
          track: "border-s-white",
          filler: "bg-gradient-to-r from-white to-main-blue",
        }}
        onChange={handleChange}
        renderThumb={(props) => (
          <div
            {...props}
            className="group top-1/2 p-0.2 bg-main-blue border-small border-default-200 dark:border-default-400/50 shadow-medium rounded-full cursor-grab data-[dragging=true]:cursor-grabbing "
          >
            <span className="transition-transform bg-white shadow-small from-white to-main-blue rounded-full w-5 h-5 flex items-center justify-center text-s text-black group-data-[dragging=true]:scale-80">
              {/* {sliderValue} */}
            </span>
          </div>
        )}
      />
      <div className="text-sm">{sliderValue}</div>
    </div>
  );
};

export default SizeSlider;
