"use client";
import React from "react";
import CustomGenerateButton from "@/app/ui/explore/button/base-type/generate-button";

interface Generate3DButtonProps {
  onClick: () => void;
  isLoading?: boolean; // Make isLoading optional
  color: string;
  radiusSide: "none" | "sm" | "md" | "lg" | "full" | "left-full" | "right-full";
  size: "sm" | "md" | "lg";
  buttonText: string;
  icon: React.ReactNode;
  iconPosition: "left" | "right";
  iconSize: string;
}

export default function Generate3DButton({
  onClick,
  isLoading = false, // Default to false if isLoading is not provided
  color,
  radiusSide,
  size,
  buttonText,
  icon,
  iconPosition,
  iconSize,
}: Generate3DButtonProps) {
  const iconStyles = `stroke-0.1 ${iconSize}`;

  const styledIcon = React.cloneElement(icon as React.ReactElement, {
    className: iconStyles,
  });

  const startContent = iconPosition === "left" ? styledIcon : null;
  const endContent = iconPosition === "right" ? styledIcon : null;
  return (
    <CustomGenerateButton
      isLoading={isLoading}
      color={
        color as
          | "default"
          | "primary"
          | "secondary"
          | "success"
          | "warning"
          | "danger"
      }
      variant="solid"
      radius={radiusSide}
      size={size}
      onClick={onClick}
      ariaLabel="Generate 3D Model"
      className="flex items-center justify-center space-x-2 transition-all ease-in-out duration-300 hover:scale-105"
      startContent={startContent}
      endContent={endContent}
    >
      {buttonText}
    </CustomGenerateButton>
  );
}
