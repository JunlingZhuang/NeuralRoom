"use client";

import { BsClockHistory } from "react-icons/bs";
import React from "react";
import UserIcon from "@/app/ui/icon/user-icon";
import CustomButton from "@/app/ui/explore/button/active-button";

export default function HistoryButton({
  isActive,
  onClick,
  borderWidth,
}: {
  isActive: boolean;
  onClick: () => void;
  borderWidth: number;
}) {
  return (
    <CustomButton
      color="secondary"
      variant="bordered"
      radius="full"
      size="sm"
      isActive={isActive}
      onClick={onClick}
      ariaLabel="history Panel"
      borderWidth={borderWidth}
    >
      <BsClockHistory className="stroke-0.5 size-10" />
    </CustomButton>
  );
}
