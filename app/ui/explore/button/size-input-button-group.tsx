import SizeSlider from "@/app/ui/explore/button/size-slider";
import { Button } from "@nextui-org/react";
import CustomTabButton from "@/app/ui/explore/button/active-button";
import Generate3DButton from "@/app/ui/explore/button/generate-3D-button";
import { useBoxSize } from "@/app/lib/context/BoxSizeContext";
import { generate3DModel } from "@/app/lib/data";

export default function SizeInputButtonGroup() {
  const { boxSizeManager, setModel } = useBoxSize();
  const currentBoxSize = boxSizeManager.getSize();

  const handleGenerate3DModel = async () => {
    try {
      const modelPath = await generate3DModel(currentBoxSize);
      setModel(modelPath); // 更新模型数据
      console.log("3D model generated:", modelPath);
    } catch (error) {
      console.error("Failed to generate 3D model:", error);
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
          onClick={
            handleGenerate3DModel
            // console.log("Generate 3D Button Clicked");
          }
        />
      </div>
    </div>
  );
}
