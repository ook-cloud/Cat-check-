import type { ReactNode } from "react";

const BORDERS = {
  none: "border-line",
  cat: "border-cat",
  notCat: "border-green",
  right: "border-green",
  wrong: "border-red",
};

interface PhotoTileProps {
  src: string;
  alt: string;
  border?: keyof typeof BORDERS;
  /** When set, a × button in the corner removes the photo. */
  onRemove?: () => void;
  children?: ReactNode;
}

export const PhotoTile = ({ src, alt, border = "none", onRemove, children }: PhotoTileProps) => (
  <div
    className={`relative grid content-start overflow-hidden rounded-xl border-2 bg-card ${BORDERS[border]}`}
  >
    {/* Stored photos come from a host set per project, so next/image is not used. */}
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img src={src} alt={alt} className="aspect-square w-full object-cover" />
    {onRemove && (
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Delete ${alt}`}
        title="Delete this photo"
        className="absolute top-1.5 right-1.5 grid size-8 cursor-pointer place-items-center rounded-full bg-card/90 text-ink shadow hover:bg-red hover:text-white"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true" className="size-4">
          <path
            d="M6 6l12 12M18 6L6 18"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </svg>
      </button>
    )}
    {children}
  </div>
);

export const PhotoGrid = ({ children }: { children: ReactNode }) => (
  <div className="grid grid-cols-[repeat(auto-fill,minmax(130px,1fr))] gap-3">{children}</div>
);
