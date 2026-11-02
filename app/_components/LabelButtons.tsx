import type { Label } from "@/lib/types";

interface LabelButtonsProps {
  value: Label | null;
  onChange: (label: Label) => void;
}

export const LabelButtons = ({ value, onChange }: LabelButtonsProps) => (
  <div className="grid grid-cols-2 border-t-2 border-line text-center text-[15px] font-bold">
    <button
      type="button"
      aria-pressed={value === "CAT"}
      onClick={() => onChange("CAT")}
      className={`cursor-pointer px-1 py-2.5 ${value === "CAT" ? "bg-cat-soft text-cat" : "hover:bg-page"}`}
    >
      Cat
    </button>
    <button
      type="button"
      aria-pressed={value === "NOT_CAT"}
      onClick={() => onChange("NOT_CAT")}
      className={`cursor-pointer border-l-2 border-line px-1 py-2.5 ${
        value === "NOT_CAT" ? "bg-green-soft text-green" : "hover:bg-page"
      }`}
    >
      Not cat
    </button>
  </div>
);
