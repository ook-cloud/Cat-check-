import type { ReactNode } from "react";

interface MainButtonProps {
  children: ReactNode;
  onClick: () => void;
  big?: boolean;
}

export const MainButton = ({ children, onClick, big = false }: MainButtonProps) => (
  <button
    type="button"
    onClick={onClick}
    className={`cursor-pointer rounded-xl bg-blue font-bold text-white hover:opacity-90 ${
      big ? "justify-self-center px-[34px] py-[18px] text-[19px]" : "px-[26px] py-3.5 text-[17px]"
    }`}
  >
    {children}
  </button>
);
