import SizeSlider from "@/app/ui/explore/button/size-slider";
import { Button } from "@nextui-org/react";
import CustomTabButton from "@/app/ui/explore/button/active-button";
import Generate3DButton from "@/app/ui/explore/button/generate-3D-button";

export default function SizeInputButtonGroup() {
  return (
    <div className="flex flex-row gap-1 bg-transparent ">
      <div className="shadow-2xl backdrop-blur-xl rounded-tl-full flex items-center rounded-bl-full basis-1/4 grow h-12  bg-panel-bg bg-opacity-60 p-2">
        <SizeSlider initialValue={20} label="Length" maxValue={100} />
      </div>
      <div className="shadow-2xl backdrop-blur-xl flex items-center basis-1/4 grow h-12 bg-panel-bg bg-opacity-60 p-2">
        <SizeSlider initialValue={20} label="Width" maxValue={100} />
      </div>
      <div className="shadow-2xl backdrop-blur-xl flex items-center basis-1/4 grow h-12 bg-panel-bg bg-opacity-60 p-2">
        <SizeSlider initialValue={20} label="Height" maxValue={3} />
      </div>
      <div className="flex-none">
        <Generate3DButton
          onClick={() => {
            console.log("Generate 3D Button Clicked");
          }}
        />
      </div>
    </div>
  );
}
