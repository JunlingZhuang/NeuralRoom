"use client";

import React from "react";
import { Button } from "@nextui-org/react";
import classNames from "classnames";

interface CustomButtonProps {
  color: "default" | "primary" | "secondary" | "success" | "warning" | "danger";
  variant:
    | "light"
    | "shadow"
    | "bordered"
    | "solid"
    | "flat"
    | "faded"
    | "ghost";
  radius: "none" | "sm" | "md" | "lg" | "full";
  size: "sm" | "md" | "lg";
  isActive: boolean;
  onClick: () => void;
  children: React.ReactNode;
  ariaLabel: string;
}

export default function CustomButton({
  color,
  variant,
  radius,
  size,
  isActive,
  onClick,
  children,
  ariaLabel,
}: CustomButtonProps) {
  return (
    <Button
      isIconOnly
      className={classNames(
        isActive ? "bg-main-blue border-black ring-4 ring-main-blue" : ""
      )}
      color={color}
      variant={variant}
      aria-label={ariaLabel}
      radius={radius}
      size={size}
      onClick={onClick}
    >
      {React.cloneElement(children as React.ReactElement, {
        className: classNames(
          (children as React.ReactElement).props.className,
          isActive ? "text-black" : "text-current"
        ),
      })}
    </Button>
  );
}
