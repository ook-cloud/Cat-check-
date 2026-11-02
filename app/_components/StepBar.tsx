const STEPS = ["Upload", "Label", "Train", "Test"];

interface StepBarProps {
  /** The step you are on, from 1 to 4. */
  current: number;
}

export const StepBar = ({ current }: StepBarProps) => (
  <ol className="grid grid-cols-4 gap-2 text-center text-[15px] font-bold">
    {STEPS.map((label, index) => {
      const number = index + 1;
      const isCurrent = number === current;
      const isDone = number < current;
      return (
        <li
          key={label}
          aria-current={isCurrent ? "step" : undefined}
          className={`grid justify-items-center gap-1.5 ${isCurrent ? "text-ink" : "text-muted"}`}
        >
          <span
            className={`grid size-10 place-items-center rounded-full border-2 font-display text-lg font-semibold ${
              isCurrent
                ? "border-blue bg-blue text-white"
                : isDone
                  ? "border-blue bg-blue-soft text-blue"
                  : "border-line bg-card"
            }`}
          >
            {number}
          </span>
          {label}
        </li>
      );
    })}
  </ol>
);
