interface CountPillsProps {
  cats: number;
  notCats: number;
  unlabeled: number;
}

const PILL = "rounded-full px-3.5 py-1.5 text-[15px] font-bold";

export const CountPills = ({ cats, notCats, unlabeled }: CountPillsProps) => (
  <div aria-live="polite" className="flex flex-wrap gap-2.5">
    <span className={`${PILL} bg-cat-soft text-cat`}>Cat: {cats}</span>
    <span className={`${PILL} bg-green-soft text-green`}>Not cat: {notCats}</span>
    <span className={`${PILL} bg-page text-muted`}>Still to label: {unlabeled}</span>
  </div>
);
