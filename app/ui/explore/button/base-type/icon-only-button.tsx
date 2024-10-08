import React from "react";
import { Tooltip, Button } from "@nextui-org/react";

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
    <Tooltip
      showArrow={true}
      placement="right"
      color="warning"
      content={ariaLabel}
    >
      <Button
        isIconOnly
        color={color}
        variant={variant}
        radius={radiusSize}
        aria-label={ariaLabel}
        size={size}
        onClick={onClick}
        className="transition-all ease-in-out hover:scale-125 duration-300"
      >
        {icon}
      </Button>
    </Tooltip>
  );
}
