import type { ReactNode } from "react";

interface LockedButtonProps {
  /** Says what is missing, like "Add 2 more photos". */
  children: ReactNode;
  big?: boolean;
}

export const LockedButton = ({ children, big = false }: LockedButtonProps) => (
  <button
    type="button"
    aria-disabled="true"
    className={`cursor-not-allowed rounded-xl bg-line font-bold text-muted ${
      big ? "justify-self-center px-[34px] py-[18px] text-[19px]" : "px-[26px] py-3.5 text-[17px]"
    }`}
  >
    {children}
  </button>
);
