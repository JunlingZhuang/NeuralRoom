import React, { useState, useEffect, useRef } from "react";
import IconOnlyFilledButton from "@/app/ui/explore/button/base-type/icon-only-filled-button";
import { BsHeart } from "react-icons/bs";
import { BsClockHistory } from "react-icons/bs";
import { useGenerationManager } from "@/app/lib/context/generationContext";
import { screenshotService } from "@/app/lib/services";

export default function HistoryCollectionButtonGroup() {
  const [isLiked, setIsLiked] = useState(false);
  const [isAddToHistory, setIsAddToHistory] = useState(false);
  const {
    modelManager,
    graphManager,
    userProfileManager,
    saveCurrentState,
    setStateUpdated,
  } = useGenerationManager();
  const hasSavedRef = useRef(false);

  const handleClickAddToCollection = () => {
    setIsLiked(!isLiked);
    if (isLiked) {
    }
  };

  const handleAddToClickHistory = () => {
    setIsAddToHistory((prev) => {
      if (!prev) {
        const screenshot = screenshotService.captureScreenshot();
        if (screenshot) {
          modelManager.updateCurrentImage(screenshot);
        }
        setStateUpdated(true);
        hasSavedRef.current = false; // Reset the flag when adding to history
      }
      return !prev;
    });
  };

  useEffect(() => {
    setIsLiked(false);
    setIsAddToHistory(false);
  }, [
    modelManager.model,
    modelManager.boundingBoxSize,
    graphManager.graph,
    userProfileManager.currentProfile,
  ]);

  useEffect(() => {
    if (isAddToHistory && !hasSavedRef.current) {
      saveCurrentState();
      console.log("Save current state");
      hasSavedRef.current = true; // Set the flag to prevent multiple saves
    }
  }, [isAddToHistory, saveCurrentState]);

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
