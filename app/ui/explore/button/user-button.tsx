"use client";

import React from "react";
import UserIcon from "@/app/ui/icon/user-icon";
import CustomButton from "@/app/ui/explore/button/active-button";

export default function UserButton({
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
      ariaLabel="User Panel"
      borderWidth={borderWidth}
    >
      <UserIcon />
    </CustomButton>
  );
}
