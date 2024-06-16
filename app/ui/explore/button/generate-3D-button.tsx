"use client";
import React from "react";
import { BsBox } from "react-icons/bs";
import CustomGenerateButton from "@/app/ui/explore/button/generate-button";

interface Generate3DButtonProps {
  onClick: () => void;
  isLoading: boolean;
}

export default function Generate3DButton({
  onClick,
  isLoading,
}: Generate3DButtonProps) {
  return (
    <CustomGenerateButton
      isLoading={isLoading}
      color="primary"
      variant="solid"
      radius="right-full"
      size="lg"
      onClick={onClick}
      ariaLabel="Generate 3D Model"
      endContent={<BsBox className="stroke-0.1 size-7" />}
    >
      Generate
    </CustomGenerateButton>
  );
}
