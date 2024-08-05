import React, { useState } from "react";
import SizeSlider from "@/app/ui/explore/button/base-type/size-slider";
import Generate3DButton from "@/app/ui/explore/button/action-raidus-boarder-button";
import { useGenerationManager } from "@/app/lib/context/generationContext";
import { generate3DModel_Backend } from "@/app/lib/data";
import RandomButton from "@/app/ui/explore/button/base-type/icon-only-button";
import { CgDice5 } from "react-icons/cg";

interface InputPanelButtonGroupProps {
  isRandomButtonVisible: boolean;
  LeftContentButtonLabel: string;
  LeftContentButtonOnClick: () => void;
  LeftContentButtonIcon: React.ReactNode;
  RightContentButtonLabel: string;
  RightContentButtonOnClick: () => void;
  RightContentButtonIcon: React.ReactNode;
}

export default function InputPanelButtonGroup({
  isRandomButtonVisible,
  LeftContentButtonLabel,
  LeftContentButtonOnClick,
  LeftContentButtonIcon,
  RightContentButtonLabel,
  RightContentButtonOnClick,
  RightContentButtonIcon,
}: InputPanelButtonGroupProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleRandomInput = () => {
    console.log("Click on Random input");
  };

  return (
    <div className="flex flex-row gap-1 justify-between">
      <div className="random-button">
        {isRandomButtonVisible ? (
          <RandomButton
            icon={<CgDice5 />}
            color="secondary"
            variant="solid"
            radiusSize="full"
            size="sm"
            onClick={handleRandomInput}
            ariaLabel="Random Input"
          />
        ) : (
          <div className="w-12"></div> //placeholder for case of invisible
        )}
      </div>
      <div className="function-button-group gap-1 flex flex-row">
        <Generate3DButton
          isLoading={isLoading}
          onClick={LeftContentButtonOnClick}
          color="secondary"
          radiusSide="left-full"
          size="sm"
          buttonText={LeftContentButtonLabel}
          icon={LeftContentButtonIcon}
          iconPosition="left"
          iconSize="size-5"
        />
        <Generate3DButton
          isLoading={isLoading}
          onClick={RightContentButtonOnClick}
          color="primary"
          radiusSide="right-full"
          size="sm"
          buttonText={RightContentButtonLabel}
          icon={RightContentButtonIcon}
          iconPosition="right"
          iconSize="size-5"
        />
      </div>
    </div>
  );
}
