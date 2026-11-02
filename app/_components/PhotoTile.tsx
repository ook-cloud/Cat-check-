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
  children?: ReactNode;
}

export const PhotoTile = ({ src, alt, border = "none", children }: PhotoTileProps) => (
  <div className={`grid content-start overflow-hidden rounded-xl border-2 bg-card ${BORDERS[border]}`}>
    {/* Stored photos come from a host set per project, so next/image is not used. */}
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img src={src} alt={alt} className="aspect-square w-full object-cover" />
    {children}
  </div>
);

export const PhotoGrid = ({ children }: { children: ReactNode }) => (
  <div className="grid grid-cols-[repeat(auto-fill,minmax(130px,1fr))] gap-3">{children}</div>
);
