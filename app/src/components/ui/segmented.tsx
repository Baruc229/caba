"use client";

interface SegmentedProps<T extends string> {
  options: ReadonlyArray<{ value: T; label: string }>;
  value: T;
  onChange: (value: T) => void;
  ariaLabel: string;
  className?: string;
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
  className = "",
}: SegmentedProps<T>) {
  const index = Math.max(
    0,
    options.findIndex((option) => option.value === value)
  );

  return (
    <div className={`seg ${className}`} role="group" aria-label={ariaLabel}>
      <span
        className="seg-thumb"
        style={{ transform: `translateX(${index * 100}%)` }}
        aria-hidden="true"
      />
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={option.value === value}
          className={`seg-btn${option.value === value ? " is-active" : ""}`}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
