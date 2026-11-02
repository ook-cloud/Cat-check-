import type { ReactNode } from "react";

interface StepCardProps {
  title: string;
  children: ReactNode;
}

export const StepCard = ({ title, children }: StepCardProps) => (
  <section className="grid gap-5 rounded-2xl border border-line bg-card p-5 sm:p-7">
    <h2 className="font-display text-[26px] leading-tight font-semibold">{title}</h2>
    {children}
  </section>
);
