"use client";

import { useState } from "react";

interface AccuracyChartProps {
  /** How often the model was right in each finished round, from 0 to 1. */
  accuracies: number[];
  rounds: number;
}

const LEFT = 44;
const RIGHT = 388;
const TOP = 12;
const BOTTOM = 158;

const percent = (accuracy: number) => `${Math.round(accuracy * 100)}%`;

export const AccuracyChart = ({ accuracies, rounds }: AccuracyChartProps) => {
  const [hovered, setHovered] = useState<number | null>(null);

  const step = (RIGHT - LEFT) / (rounds - 1);
  const x = (index: number) => LEFT + index * step;
  const y = (accuracy: number) => BOTTOM - accuracy * (BOTTOM - TOP);

  const line = accuracies.map((a, i) => `${i === 0 ? "M" : "L"}${x(i)} ${y(a)}`).join(" ");
  const marked = hovered !== null && hovered < accuracies.length ? hovered : accuracies.length - 1;
  const description =
    accuracies.length === 0
      ? "Accuracy chart. No rounds finished yet."
      : `Accuracy by round: ${accuracies.map((a, i) => `round ${i + 1} ${percent(a)}`).join(", ")}.`;

  return (
    <svg viewBox="0 0 400 200" role="img" aria-label={description} className="h-auto w-full">
      <g stroke="#dfe4ee">
        <line x1={LEFT} x2={RIGHT} y1={BOTTOM} y2={BOTTOM} />
        <line x1={LEFT} x2={RIGHT} y1={(BOTTOM + TOP) / 2} y2={(BOTTOM + TOP) / 2} />
        <line x1={LEFT} x2={RIGHT} y1={TOP} y2={TOP} />
      </g>
      <g fill="#5d6779" fontSize="12" textAnchor="end">
        <text x="36" y={BOTTOM + 4}>0%</text>
        <text x="36" y={(BOTTOM + TOP) / 2 + 4}>50%</text>
        <text x="36" y={TOP + 4}>100%</text>
      </g>
      <g fill="#5d6779" fontSize="12" textAnchor="middle">
        <text x={LEFT} y="192">round 1</text>
        <text x={x(4)} y="192">round 5</text>
        <text x={RIGHT - 12} y="192">round {rounds}</text>
      </g>

      {accuracies.length > 0 && (
        <>
          <path d={line} fill="none" stroke="#3b5bdb" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx={x(marked)} cy={y(accuracies[marked])} r="5" fill="#3b5bdb" stroke="#ffffff" strokeWidth="2" />
        </>
      )}

      {hovered !== null && hovered < accuracies.length && (
        <text
          x={Math.min(Math.max(x(hovered), LEFT + 40), RIGHT - 40)}
          y={Math.min(y(accuracies[hovered]) + 22, BOTTOM - 4)}
          fill="#1d2433"
          fontSize="12"
          fontWeight="700"
          textAnchor="middle"
        >
          Round {hovered + 1}: {percent(accuracies[hovered])}
        </text>
      )}

      {accuracies.map((_, i) => (
        <rect
          key={i}
          x={x(i) - step / 2}
          y={TOP}
          width={step}
          height={BOTTOM - TOP}
          fill="transparent"
          onMouseEnter={() => setHovered(i)}
          onMouseLeave={() => setHovered(null)}
        />
      ))}
    </svg>
  );
};
