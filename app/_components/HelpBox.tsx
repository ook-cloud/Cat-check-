import type { ReactNode } from "react";

interface HelpBoxProps {
  title: string;
  children: ReactNode;
}

export const HelpBox = ({ title, children }: HelpBoxProps) => (
  <div className="rounded-xl bg-blue-soft px-4 py-3.5 text-[15px]">
    <b>{title}</b> {children}
  </div>
);
