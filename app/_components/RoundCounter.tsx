interface RoundCounterProps {
  round: number;
  total: number;
}

export const RoundCounter = ({ round, total }: RoundCounterProps) => (
  <div className="text-center font-display text-[44px] leading-tight font-semibold">
    <div className="font-body text-[15px] font-normal text-muted">Round</div>
    {round} / {total}
  </div>
);
