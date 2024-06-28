"use client";

import React from "react";
import UserIcon from "@/app/ui/icon/user-icon";
import CustomActiveButton from "@/app/ui/explore/button/base-type/active-button";
import { GoScreenFull } from "react-icons/go";

export default function GraphButton({
  isActive,
  onClick,
  borderWidth,
}: {
  isActive: boolean;
  onClick: () => void;
  borderWidth?: number;
}) {
  return (
    <CustomActiveButton
      color="secondary"
      variant="bordered"
      radius="full"
      size="sm"
      isActive={isActive}
      onClick={onClick}
      ariaLabel="Graph Panel"
      borderWidth={borderWidth}
    >
      <GoScreenFull className="stroke-0.5 size-20" />
    </CustomActiveButton>
  );
}
