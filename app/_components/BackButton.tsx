interface BackButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

export const BackButton = ({ onClick, disabled = false }: BackButtonProps) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className="cursor-pointer rounded-xl border-2 border-line bg-transparent px-[26px] py-3.5 text-[17px] font-bold text-ink hover:bg-page disabled:cursor-not-allowed disabled:text-muted disabled:hover:bg-transparent"
  >
    Back
  </button>
);
