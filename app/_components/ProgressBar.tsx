interface ProgressBarProps {
  value: number;
  max: number;
  label: string;
}

export const ProgressBar = ({ value, max, label }: ProgressBarProps) => (
  <div
    role="progressbar"
    aria-label={label}
    aria-valuemin={0}
    aria-valuemax={max}
    aria-valuenow={value}
    className="h-3.5 overflow-hidden rounded-[7px] border border-line bg-page"
  >
    <div
      className="h-full rounded-[7px] bg-blue transition-[width] duration-300"
      style={{ width: `${(value / max) * 100}%` }}
    />
  </div>
);
