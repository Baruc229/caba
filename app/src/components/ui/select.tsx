"use client";

import { useEffect, useRef, useState } from "react";
import { FaCheck, FaChevronDown } from "react-icons/fa6";

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  options: SelectOption[];
  name?: string;
  id?: string;
  ariaLabel?: string;
  placeholder?: string;
  variant?: "field" | "boxed";
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  className?: string;
}

export function Select({
  options,
  name,
  id,
  ariaLabel,
  placeholder,
  variant = "boxed",
  value: controlledValue,
  defaultValue = "",
  onChange,
  className = "",
}: SelectProps) {
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);

  const value = controlledValue !== undefined ? controlledValue : uncontrolledValue;
  const selected = options.find((option) => option.value === value);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!wrapRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const openMenu = () => {
    const currentIndex = options.findIndex((option) => option.value === value);
    setHighlight(currentIndex >= 0 ? currentIndex : 0);
    setOpen(true);
  };

  const commit = (option: SelectOption) => {
    onChange?.(option.value);
    setUncontrolledValue(option.value);
    setOpen(false);
  };

  return (
    <div ref={wrapRef} className={`select select--${variant} ${className}`}>
      <button
        type="button"
        id={id}
        className="select-trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => (open ? setOpen(false) : openMenu())}
        onKeyDown={(event) => {
          if (!open && (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ")) {
            event.preventDefault();
            openMenu();
          }
        }}
      >
        <span className={selected ? undefined : "select-placeholder"}>
          {selected?.label ?? placeholder ?? "\u00a0"}
        </span>
        <FaChevronDown
          aria-hidden="true"
          size={variant === "field" ? 11 : 12}
          className={`select-chevron${open ? " is-open" : ""}`}
        />
      </button>

      {open && (
        <ul
          className="select-menu"
          role="listbox"
          aria-label={ariaLabel}
          tabIndex={-1}
          onKeyDown={(event) => {
            if (event.key === "ArrowDown") {
              event.preventDefault();
              setHighlight((h) => Math.min(options.length - 1, h + 1));
            } else if (event.key === "ArrowUp") {
              event.preventDefault();
              setHighlight((h) => Math.max(0, h - 1));
            } else if (event.key === "Enter") {
              event.preventDefault();
              commit(options[highlight]);
            }
          }}
        >
          {options.map((option, index) => (
            <li key={option.value}>
              <button
                type="button"
                role="option"
                aria-selected={option.value === value}
                className={`select-option${index === highlight ? " is-highlighted" : ""}${
                  option.value === value ? " is-selected" : ""
                }`}
                onMouseEnter={() => setHighlight(index)}
                onClick={() => commit(option)}
              >
                <span>{option.label}</span>
                {option.value === value && <FaCheck aria-hidden="true" size={11} />}
              </button>
            </li>
          ))}
        </ul>
      )}

      {name && <input type="hidden" name={name} value={value} />}
    </div>
  );
}
