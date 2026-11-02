"use client";

import { useRef } from "react";

interface UploadBoxProps {
  title: string;
  hint: string;
  multiple?: boolean;
  disabled?: boolean;
  onFiles: (files: File[]) => void;
}

export const UploadBox = ({ title, hint, multiple = false, disabled = false, onFiles }: UploadBoxProps) => {
  const input = useRef<HTMLInputElement>(null);

  return (
    <>
      <button
        type="button"
        disabled={disabled}
        onClick={() => input.current?.click()}
        className="grid cursor-pointer justify-items-center gap-1.5 rounded-2xl border-[3px] border-dashed border-line px-5 py-9 text-center hover:border-blue disabled:cursor-not-allowed disabled:hover:border-line"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true" className="size-14 text-blue">
          <path
            d="M12 16V4m0 0l-5 5m5-5l5 5M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <b>{title}</b>
        <span className="text-muted">{hint}</span>
      </button>
      <input
        ref={input}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple={multiple}
        hidden
        onChange={(event) => {
          const files = Array.from(event.target.files ?? []);
          event.target.value = ""; // lets you choose the same photo again
          if (files.length > 0) onFiles(files);
        }}
      />
    </>
  );
};
