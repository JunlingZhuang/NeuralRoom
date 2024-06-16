import React, { useState } from "react";
import { Slider } from "@nextui-org/react";
import { useBoxSize } from "@/app/lib/context/BoxSizeContext";
import { BoxSize } from "@/app/lib/definition/box-definition";

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
  const { boxSizeManager, setModel } = useBoxSize(); // Get setModel from context

  const handleChange = (sliderValue: number | number[]) => {
    if (typeof sliderValue !== "number") return;
    setSliderValue(sliderValue);
    const newBoxSize = { [label]: sliderValue };
    boxSizeManager.updateSize(newBoxSize as Partial<BoxSize>);
    setModel(null); // Set model to null to trigger box rendering
    console.log("Updated box size:", boxSizeManager.getSize()); // Add a console log to verify updates
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
