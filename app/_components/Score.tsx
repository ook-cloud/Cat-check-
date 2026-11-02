interface ScoreProps {
  right: number;
  total: number;
}

export const Score = ({ right, total }: ScoreProps) => (
  <div className="text-center">
    <div className="font-display text-5xl leading-tight font-semibold">
      {right} / {total}
    </div>
    <div className="text-muted">test photos right</div>
  </div>
);
