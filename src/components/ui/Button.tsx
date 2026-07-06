import React from 'react';

export const SECONDARY_BUTTON_CLASS = "px-6 py-3 border border-slate-300 text-slate-700 bg-white rounded-lg font-bold hover:bg-slate-50 transition-colors shadow-sm";

export type ButtonProps = {
  variant: "primary" | "secondary";
  onClick?: () => void;
  disabled?: boolean;
  icon?: React.ReactNode;
  fullWidthOnMobile?: boolean;
  children: React.ReactNode;
  className?: string;
};

export default function Button({
  variant,
  onClick,
  disabled = false,
  icon,
  fullWidthOnMobile = true,
  children,
  className = "",
}: ButtonProps) {
  const baseClass = "transition-all flex items-center justify-center gap-2";
  const mobileClass = fullWidthOnMobile ? "w-full sm:w-auto" : "";
  const disabledClass = disabled ? "opacity-50 cursor-not-allowed" : "";

  let variantClass = "";
  if (variant === "primary") {
    variantClass = "px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-sm hover:bg-indigo-700 hover:-translate-y-0.5";
  } else if (variant === "secondary") {
    // Note: this is typically for button, but secondary is mostly used as Link in this phase.
    // Kept here in case a secondary button is needed.
    variantClass = SECONDARY_BUTTON_CLASS;
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`${baseClass} ${variantClass} ${mobileClass} ${disabledClass} ${className}`.trim()}
    >
      {children}
      {icon && <span aria-hidden="true">{icon}</span>}
    </button>
  );
}
