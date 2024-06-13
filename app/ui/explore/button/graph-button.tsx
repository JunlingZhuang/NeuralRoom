"use client";

import React from "react";
import UserIcon from "@/app/ui/icon/user-icon";
import CustomButton from "@/app/ui/explore/button/active-button";

export default function GraphButton({
  isActive,
  onClick,
}: {
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <CustomButton
      color="secondary"
      variant="bordered"
      radius="full"
      size="md"
      isActive={isActive}
      onClick={onClick}
      ariaLabel="Graph Panel"
    >
      <UserIcon />
    </CustomButton>
  );
}
