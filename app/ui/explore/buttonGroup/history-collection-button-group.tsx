import React, { useState } from "react";
import IconOnlyFilledButton from "@/app/ui/explore/button/base-type/icon-only-filled-button";
import { BsHeart } from "react-icons/bs";
import { BsClockHistory } from "react-icons/bs";

export default function HistoryCollectionButtonGroup() {
  const [isLiked, setIsLiked] = useState(false);
  const [isAddToHistory, setIsAddToHistory] = useState(false);

  const handleClickAddToCollection = () => {
    setIsLiked(!isLiked);
  };

  const handleAddToClickHistory = () => {
    setIsAddToHistory(!isAddToHistory);
  };

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
