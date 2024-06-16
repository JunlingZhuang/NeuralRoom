"use client";

import React from "react";
import { Button } from "@nextui-org/react";
import classNames from "classnames";

interface CustomGenerateButtonProps {
  isLoading: boolean;
  color: "default" | "primary" | "secondary" | "success" | "warning" | "danger";
  variant:
    | "light"
    | "shadow"
    | "bordered"
    | "solid"
    | "flat"
    | "faded"
    | "ghost";
  radius: "none" | "sm" | "md" | "lg" | "full" | "left-full" | "right-full"; // 增加自定义的圆角选项
  size: "sm" | "md" | "lg";
  onClick: () => void;
  children: React.ReactNode;
  ariaLabel: string;
  startContent?: React.ReactNode;
  endContent?: React.ReactNode;
}

export default function CustomGenerateButton({
  isLoading,
  color,
  variant,
  radius,
  size,
  onClick,
  children,
  ariaLabel,
  startContent,
  endContent,
}: CustomGenerateButtonProps) {
  const radiusClass = classNames({
    "rounded-none": radius === "none",
    "rounded-sm": radius === "sm",
    "rounded-md": radius === "md",
    "rounded-lg": radius === "lg",
    "rounded-full": radius === "full",
    "rounded-l-full": radius === "left-full",
    "rounded-r-full": radius === "right-full",
  });

  return (
    <Button
      isLoading={isLoading}
      color={color}
      variant={variant}
      aria-label={ariaLabel}
      className={radiusClass}
      size={size}
      onClick={onClick}
      startContent={startContent}
      endContent={endContent}
    >
      <span className="flex items-center space-x-2 text-black">
        {children}
      </span>
    </Button>
  );
}
