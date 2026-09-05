"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

interface PopoverProps {
  open: boolean;
  onClose: () => void;
  anchorRef: React.RefObject<HTMLElement | null>;
  children: React.ReactNode;
  /** start = bord gauche du trigger aligné avec gauche du popover */
  align?: "start" | "end";
  offset?: number;
  /** Largeur fixe du popover (ex. calendrier) */
  width?: number;
  /** Largeur = largeur du trigger */
  matchWidth?: boolean;
  minWidth?: number;
}

/**
 * Positionne un contenu en overlay fixe, ancré au trigger (getBoundingClientRect),
 * branché dans un portail React → jamais clippé par un ancêtre overflow/scroll.
 * Se retourne au-dessus si pas de place en bas, se repositionne au scroll.
 */
export function Popover({
  open,
  onClose,
  anchorRef,
  children,
  align = "start",
  offset = 6,
  width,
  matchWidth = false,
  minWidth = 200,
}: PopoverProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number; width: number } | null>(null);
  const [ready, setReady] = useState(false);

  useLayoutEffect(() => {
    if (!open) return;
    let raf = 0;

    const compute = () => {
      const anchor = anchorRef.current;
      const root = rootRef.current;
      if (!anchor || !root) return;

      const a = anchor.getBoundingClientRect();
      const desiredW =
        width ?? (matchWidth ? a.width : Math.max(root.offsetWidth, minWidth));
      const clampedW = Math.max(8, Math.min(desiredW, window.innerWidth - 16));

      root.style.width = `${clampedW}px`;
      const rootH = root.offsetHeight;

      let top = a.bottom + offset;
      if (top + rootH > window.innerHeight - 8 && a.top - offset - rootH > 8) {
        top = a.top - offset - rootH;
      } else if (top + rootH > window.innerHeight - 8) {
        top = Math.max(8, window.innerHeight - rootH - 8);
      }

      let left = align === "start" ? a.left : a.right - clampedW;
      if (left + clampedW > window.innerWidth - 8) left = Math.max(8, window.innerWidth - clampedW - 8);
      left = Math.max(8, left);

      setPos({ top, left, width: clampedW });
      setReady(true);
    };

    const schedule = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(compute);
    };

    schedule();
    window.addEventListener("scroll", schedule, true);
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", schedule, true);
      window.removeEventListener("resize", schedule);
    };
  }, [open, anchorRef, align, offset, width, matchWidth, minWidth]);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: MouseEvent) => {
      const target = e.target as Node;
      if (anchorRef.current?.contains(target)) return;
      if (rootRef.current?.contains(target)) return;
      onClose();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    const id = setTimeout(() => {
      window.addEventListener("click", onPointer);
      window.addEventListener("keydown", onKey);
    }, 0);
    return () => {
      clearTimeout(id);
      window.removeEventListener("click", onPointer);
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose, anchorRef]);

  if (!open) return null;

  return createPortal(
    <div
      ref={rootRef}
      className="popover"
      role="presentation"
      style={{
        position: "fixed",
        visibility: ready ? "visible" : "hidden",
        top: pos?.top,
        left: pos?.left,
        width: pos?.width,
        zIndex: 1300,
      }}
    >
      {children}
    </div>,
    document.body
  );
}