import React from "react";

interface IconOnlyFilledButtonProps {
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
  isLiked?: boolean;
  icon: React.ReactNode;
  activeColor: string;
  inactiveColor: string;
}

export default function IconOnlyFilledButton({
  size = "md",
  onClick,
  isLiked,
  icon,
  activeColor,
  inactiveColor,
}: IconOnlyFilledButtonProps) {
  const getSizeClass = () => {
    switch (size) {
      case "sm":
        return "w-8 h-8";
      case "md":
        return "w-12 h-12";
      case "lg":
        return "w-10 h-10";
    }
  };

  const ariaLabel = isLiked ? "Like" : "Unlike";

  return (
    <button
      type="button"
      aria-label={ariaLabel}
      className={`${getSizeClass()} rounded-full flex items-center justify-center transition-colors duration-200`}
      onClick={onClick}
    >
      {React.cloneElement(icon as React.ReactElement, {
        style: { 
          fill: isLiked ? activeColor : inactiveColor,
          width: '60%',
          height: '60%',
        },
        className: "transition-colors duration-200",
      })}
    </button>
  );
}
