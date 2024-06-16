import React, { useState } from "react";
import { Slider } from "@nextui-org/react";
import cn from "classnames";

interface SizeSliderProps {
  maxValue?: number;
  initialValue?: number;
  label?: string;
}

const SizeSlider: React.FC<SizeSliderProps> = ({
  maxValue = 0,
  initialValue = 60,
  label = "Length",
}) => {
  const [value, setValue] = useState<number>(initialValue);

  const handleChange = (value: number | number[]) => {
    if (Array.isArray(value)) {
      setValue(value[0]);
    } else {
      setValue(value);
    }
  };

  return (
    <div className="flex flex-row items-center gap-4 w-full max-w-md">
      <div className="text-sm">{label}</div>
      <Slider
        showTooltip={true}
        size="sm"
        defaultValue={value}
        maxValue={maxValue}
        minValue={0}
        step={1}
        classNames={{
          base: "max-w-md gap-3",
          track: "border-s-secondary-100",
          filler: "bg-gradient-to-r from-white to-main-blue",
        }}
        onChange={handleChange}
        renderThumb={(props) => (
          <div
            {...props}
            className="group top-1/2 p-0.2 bg-main-blue border-small border-default-200 dark:border-default-400/50 shadow-medium rounded-full cursor-grab data-[dragging=true]:cursor-grabbing "
          >
            <span className="transition-transform bg-white shadow-small from-white to-main-blue rounded-full w-5 h-5 flex items-center justify-center text-s text-black group-data-[dragging=true]:scale-80">
              {/* {value} */}
            </span>
          </div>
        )}
      />
      <div className="text-sm">{value}</div>
    </div>
  );
};

export default SizeSlider;
