import { PhotoTile } from "./PhotoTile";

interface ResultTileProps {
  src: string;
  alt: string;
  isRight: boolean;
  guessedLabel: string;
}

export const ResultTile = ({ src, alt, isRight, guessedLabel }: ResultTileProps) => (
  <PhotoTile src={src} alt={alt} border={isRight ? "right" : "wrong"}>
    <div className="grid border-t-2 border-line px-2.5 py-2 text-sm">
      <b className={isRight ? "text-green" : "text-red"}>{isRight ? "Right" : "Wrong"}</b>
      Guessed: {guessedLabel}
    </div>
  </PhotoTile>
);
