"use client";

import React from "react";
import UserIcon from "@/app/ui/icon/user-icon";
import CustomActiveButton from "@/app/ui/explore/button/base-type/active-button";

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
    <CustomActiveButton
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
    </CustomActiveButton>
  );
}
