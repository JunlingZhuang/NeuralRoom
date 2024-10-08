import React, { useState, useEffect } from "react";
import IconOnlyFilledButton from "@/app/ui/explore/button/base-type/icon-only-filled-button";
import { BsHeart } from "react-icons/bs";
import { BsClockHistory } from "react-icons/bs";
import { useGenerationManager } from "@/app/lib/context/generationContext";

export default function HistoryCollectionButtonGroup() {
  const [isLiked, setIsLiked] = useState(false);
  const [isAddToHistory, setIsAddToHistory] = useState(false);
  const { getAllSavedStates, saveCurrentState } = useGenerationManager();

  const handleClickAddToCollection = () => {
    setIsLiked(!isLiked);
    if (isLiked) {
    }
  };

  const handleAddToClickHistory = () => {
    setIsAddToHistory(!isAddToHistory);
  };

  useEffect(() => {
    if (isAddToHistory) {
      saveCurrentState();
      console.log("Save current state");
    }
  }, [isAddToHistory]);

 
  return (
    <div className="">
      <IconOnlyFilledButton
        onClick={handleClickAddToCollection}
        size="lg"
        isLiked={isLiked}
        inactiveColor="#4b5563"
        activeColor="#46A8E5"
        icon={<BsHeart />}
      />
      <IconOnlyFilledButton
        onClick={handleAddToClickHistory}
        size="lg"
        isLiked={isAddToHistory}
        inactiveColor="#4b5563"
        activeColor="#46A8E5"
        icon={<BsClockHistory />}
      />
    </div>
  );
}
