import React, { useState } from "react";

import IconOnlyFilledButton from "@/app/ui/explore/button/base-type/icon-only-filled-button";
import { CiHeart, CiTrash } from "react-icons/ci";
import { PiCubeFocusLight } from "react-icons/pi";
import { useGenerationManager } from "@/app/lib/context/generationContext";

export default function HistoryGenerationCardButtonGroup({
  stateId,
  onDelete,
}: {
  stateId: string;
  onDelete: () => void;
}) {
  const [isLiked, setIsLiked] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const { saveManager, loadSavedState } = useGenerationManager();

  const handleClickLike = () => {
    setIsLiked(!isLiked);
    console.log("Like");
  };

  const handleDelete = async () => {
    try {
      await saveManager.deleteState(stateId);
      onDelete(); // 通知父组件状态已被删除
      console.log("State deleted successfully");
    } catch (error) {
      console.error("Error deleting state:", error);
    }
  };

  const handleLoadGeneration = () => {
    console.log("Load Generation");
  };

  return (
    <div className="flex flex-row gap-1 border-1 border-panel-border rounded-lg p-1 w-auto">
      <IconOnlyFilledButton
        onClick={handleClickLike}
        size="lg"
        isLiked={isLiked}
        activeColor="#46A8E5"
        inactiveColor="#4b5563"
        icon={<CiHeart />}
      />
      <IconOnlyFilledButton
        onClick={handleDelete}
        size="lg"
        isLiked={false}
        activeColor="#46A8E5"
        inactiveColor="#4b5563"
        icon={<CiTrash />}
      />
      <IconOnlyFilledButton
        onClick={handleLoadGeneration}
        size="lg"
        isLiked={isLoaded}
        activeColor="#46A8E5"
        inactiveColor="#4b5563"
        icon={<PiCubeFocusLight />}
      />
    </div>
  );
}
