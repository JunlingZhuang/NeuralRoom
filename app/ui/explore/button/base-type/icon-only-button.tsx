import React from "react";
import { Button } from "@nextui-org/react";

interface CustomIconButtonProps {
  icon?: React.ReactNode;
  color: "default" | "primary" | "secondary" | "success" | "warning" | "danger";
  variant:
    | "light"
    | "shadow"
    | "bordered"
    | "solid"
    | "flat"
    | "faded"
    | "ghost";
  radiusSize: "none" | "sm" | "md" | "lg" | "full";
  size: "sm" | "md" | "lg";
  onClick: () => void;
  ariaLabel: string;
}

export default function CustomIconButton({
  icon,
  color,
  variant,
  radiusSize,
  size,
  onClick,
  ariaLabel,
}: CustomIconButtonProps) {
  return (
    <div className="flex gap-4 items-center">
      <Button
        isIconOnly
        color={color}
        variant={variant}
        radius={radiusSize}
        aria-label={ariaLabel}
        size={size}
        onClick={onClick}
      >
        {icon}
      </Button>
    </div>
  );
}
