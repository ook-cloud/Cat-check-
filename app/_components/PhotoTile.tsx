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
      // The corner area is the hover target, so the × shows only when the cursor reaches it.
      // Touch screens cannot hover, so there the × always shows.
      <div className="group/remove absolute top-0 right-0 p-1.5">
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Delete ${alt}`}
          title="Delete this photo"
          className="grid size-6 cursor-pointer place-items-center rounded-full bg-card/80 text-muted opacity-0 transition-opacity group-hover/remove:opacity-100 hover:bg-red hover:text-white focus-visible:opacity-100 [@media(hover:none)]:opacity-100"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true" className="size-3">
            <path
              d="M6 6l12 12M18 6L6 18"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>
    )}
    {children}
  </div>
);

export const PhotoGrid = ({ children }: { children: ReactNode }) => (
  <div className="grid grid-cols-[repeat(auto-fill,minmax(130px,1fr))] gap-3">{children}</div>
);
