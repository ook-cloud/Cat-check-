import type { Guess } from "@/lib/types";

interface GuessResultProps {
  src: string;
  guess: Guess;
}

export const GuessResult = ({ src, guess }: GuessResultProps) => {
  const isCat = guess.label === "CAT";
  const percent = Math.round(guess.confidence * 100);

  return (
    <div aria-live="polite" className="grid items-center gap-5 sm:grid-cols-[150px_1fr]">
      {/* A local preview of the chosen file, which next/image cannot optimize. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="The new photo you chose" className="size-[150px] rounded-xl border-2 border-line object-cover" />
      <div className="grid gap-2.5">
        <span className="text-muted">The model thinks this is</span>
        <span className={`font-display text-[26px] leading-tight font-semibold ${isCat ? "text-cat" : "text-green"}`}>
          {isCat ? "A cat" : "Not a cat"}
        </span>
        <div className="h-3.5 overflow-hidden rounded-[7px] border border-line bg-page">
          <div className={`h-full ${isCat ? "bg-cat" : "bg-green"}`} style={{ width: `${percent}%` }} />
        </div>
        <span className="text-muted">It is {percent}% sure.</span>
      </div>
    </div>
  );
};
