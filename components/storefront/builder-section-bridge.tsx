"use client";

import { useEffect, useRef, useState } from "react";
import { Pencil } from "lucide-react";
import { BUILDER_DRAG_MIME } from "@/lib/builder/block-registry";
import { COMPONENT_DRAG_MIME } from "@/lib/builder/components";
import {
  autoScrollStep,
  collectSectionRects,
  computeSnapGuides,
  type SnapLine,
} from "@/lib/builder/canvas-interactions";

interface BuilderSectionBridgeProps {
  enabled?: boolean;
  initialSectionId?: string | null;
}

const ACTIVE_CLASS = "ettajer-builder-section-active";
const HOVER_CLASS = "ettajer-builder-section-hover";

const OVERLAY_ID = "ettajer-builder-selection-overlay";
const SNAP_CONTAINER_ID = "ettajer-builder-snap-guides";
const PLACEHOLDER_ID = "ettajer-builder-drag-placeholder";

function clearClasses() {
  document.querySelectorAll<HTMLElement>("[data-section-id]").forEach((el) => {
    el.classList.remove(ACTIVE_CLASS, HOVER_CLASS);
    el.removeAttribute("aria-current");
  });
  document.querySelectorAll<HTMLElement>(".ettajer-builder-drop-zone").forEach((el) => {
    el.classList.remove("ettajer-builder-drop-zone-active");
  });
  document.getElementById("ettajer-builder-drop-line")?.remove();
  document.getElementById("ettajer-builder-spacing-label")?.remove();
  document.getElementById(OVERLAY_ID)?.remove();
  document.getElementById(SNAP_CONTAINER_ID)?.remove();
  document.getElementById(PLACEHOLDER_ID)?.remove();
}

function ensureSnapContainer(): HTMLElement {
  let container = document.getElementById(SNAP_CONTAINER_ID);
  if (!container) {
    container = document.createElement("div");
    container.id = SNAP_CONTAINER_ID;
    container.className = "ettajer-builder-snap-guides";
    document.body.appendChild(container);
  }
  return container;
}

function renderSnapGuides(guides: SnapLine[]) {
  const container = ensureSnapContainer();
  container.innerHTML = "";
  for (const guide of guides) {
    const line = document.createElement("div");
    line.className = "ettajer-builder-snap-line";
    if (guide.axis === "x") {
      line.classList.add("ettajer-builder-snap-line-x");
      line.style.left = `${guide.position}px`;
    } else {
      line.classList.add("ettajer-builder-snap-line-y");
      line.style.top = `${guide.position}px`;
    }
    if (guide.label) {
      const badge = document.createElement("span");
      badge.className = "ettajer-builder-snap-label";
      badge.textContent = guide.label;
      line.appendChild(badge);
    }
    container.appendChild(line);
  }
}

function hideSnapGuides() {
  document.getElementById(SNAP_CONTAINER_ID)?.remove();
}

function updateSelectionOverlay(sectionEl: HTMLElement | null, variant: "active" | "hover") {
  let overlay = document.getElementById(OVERLAY_ID) as HTMLElement | null;
  if (!sectionEl) {
    overlay?.remove();
    return;
  }

  if (!overlay) {
    overlay = document.createElement("div");
    overlay.id = OVERLAY_ID;
    overlay.className = "ettajer-builder-selection-overlay";
    overlay.innerHTML = `
      <span class="ettajer-builder-handle ettajer-builder-handle-tl"></span>
      <span class="ettajer-builder-handle ettajer-builder-handle-tr"></span>
      <span class="ettajer-builder-handle ettajer-builder-handle-bl"></span>
      <span class="ettajer-builder-handle ettajer-builder-handle-br"></span>
    `;
    document.body.appendChild(overlay);
  }

  overlay.classList.toggle("ettajer-builder-selection-overlay-active", variant === "active");
  overlay.classList.toggle("ettajer-builder-selection-overlay-hover", variant === "hover");

  const rect = sectionEl.getBoundingClientRect();
  overlay.style.top = `${rect.top}px`;
  overlay.style.left = `${rect.left}px`;
  overlay.style.width = `${rect.width}px`;
  overlay.style.height = `${rect.height}px`;
}

function showDropLine(y: number, width?: { left: number; width: number }) {
  let line = document.getElementById("ettajer-builder-drop-line");
  if (!line) {
    line = document.createElement("div");
    line.id = "ettajer-builder-drop-line";
    line.className = "ettajer-builder-drop-line";
    document.body.appendChild(line);
  }
  line.style.top = `${y}px`;
  if (width) {
    line.style.left = `${width.left}px`;
    line.style.right = "auto";
    line.style.width = `${width.width}px`;
  } else {
    line.style.left = "0";
    line.style.right = "0";
    line.style.width = "auto";
  }
  line.style.display = "block";
}

function hideDropLine() {
  const line = document.getElementById("ettajer-builder-drop-line");
  if (line) line.style.display = "none";
}

function showSpacingLabel(y: number, gap: number, x?: number) {
  let label = document.getElementById("ettajer-builder-spacing-label");
  if (!label) {
    label = document.createElement("div");
    label.id = "ettajer-builder-spacing-label";
    label.className = "ettajer-builder-spacing-label";
    document.body.appendChild(label);
  }
  label.textContent = `${Math.round(gap)}px`;
  label.style.top = `${y}px`;
  if (x != null) label.style.left = `${x}px`;
  label.style.display = "block";
}

function hideSpacingLabel() {
  const label = document.getElementById("ettajer-builder-spacing-label");
  if (label) label.style.display = "none";
}

function showDragPlaceholder(zone: HTMLElement, blockName: string | null) {
  let placeholder = document.getElementById(PLACEHOLDER_ID);
  if (!placeholder) {
    placeholder = document.createElement("div");
    placeholder.id = PLACEHOLDER_ID;
    placeholder.className = "ettajer-builder-drag-placeholder";
    document.body.appendChild(placeholder);
  }
  placeholder.textContent = blockName ?? "New block";
  const rect = zone.getBoundingClientRect();
  placeholder.style.top = `${rect.top}px`;
  placeholder.style.left = `${rect.left}px`;
  placeholder.style.width = `${rect.width}px`;
  placeholder.style.height = `${Math.max(rect.height, 64)}px`;
  placeholder.style.display = "flex";
}

function hideDragPlaceholder() {
  const placeholder = document.getElementById(PLACEHOLDER_ID);
  if (placeholder) placeholder.style.display = "none";
}

function getInsertIndexFromY(clientY: number): number {
  const zones = Array.from(document.querySelectorAll<HTMLElement>("[data-drop-index]"));
  for (const zone of zones) {
    const rect = zone.getBoundingClientRect();
    if (clientY < rect.top + rect.height / 2) {
      return Number(zone.getAttribute("data-drop-index") ?? 0);
    }
  }
  return zones.length;
}

function spacingAtInsertIndex(index: number): { gap: number; y: number; x: number } | null {
  const sections = Array.from(document.querySelectorAll<HTMLElement>("[data-section-id]"));
  if (sections.length === 0) return null;

  if (index <= 0) {
    const first = sections[0].getBoundingClientRect();
    return { gap: first.top, y: first.top / 2, x: first.left + first.width / 2 };
  }

  if (index >= sections.length) {
    const last = sections[sections.length - 1].getBoundingClientRect();
    const gap = window.innerHeight - last.bottom;
    return { gap: Math.max(gap, 0), y: last.bottom + gap / 2, x: last.left + last.width / 2 };
  }

  const prev = sections[index - 1].getBoundingClientRect();
  const next = sections[index].getBoundingClientRect();
  const gap = next.top - prev.bottom;
  return { gap, y: prev.bottom + gap / 2, x: (prev.left + next.left) / 2 + (prev.width + next.width) / 4 };
}

/** Syncs section selection, hover, and drag-drop with the website editor parent. */
export function BuilderSectionBridge({ enabled, initialSectionId }: BuilderSectionBridgeProps) {
  const [focusedId, setFocusedId] = useState<string | null>(initialSectionId ?? null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const dragActive = useRef(false);
  const dragBlockName = useRef<string | null>(null);
  const autoScrollRaf = useRef<number | null>(null);
  const pointerRef = useRef({ x: 0, y: 0 });
  const spacingRaf = useRef<number | null>(null);
  const pendingSpacing = useRef<{ y: number; gap: number; x?: number } | null>(null);

  useEffect(() => {
    if (initialSectionId) {
      lastScrolledFocusRef.current = null;
      setFocusedId(initialSectionId);
    }
  }, [initialSectionId]);

  const lastScrolledFocusRef = useRef<string | null>(null);

  useEffect(() => {
    if (!enabled) return;

    document.querySelectorAll<HTMLElement>("[data-section-id]").forEach((el) => {
      const id = el.getAttribute("data-section-id");
      const isActive = id === focusedId;
      const isHover = id === hoveredId && id !== focusedId;
      el.classList.toggle(ACTIVE_CLASS, isActive);
      el.classList.toggle(HOVER_CLASS, isHover);
      if (isActive) el.setAttribute("aria-current", "true");
      else el.removeAttribute("aria-current");
    });

    const activeEl = focusedId
      ? document.querySelector<HTMLElement>(`[data-section-id="${focusedId}"]`)
      : null;
    const hoverEl =
      hoveredId && hoveredId !== focusedId
        ? document.querySelector<HTMLElement>(`[data-section-id="${hoveredId}"]`)
        : null;

    if (activeEl) {
      updateSelectionOverlay(activeEl, "active");
    } else if (hoverEl) {
      updateSelectionOverlay(hoverEl, "hover");
    } else {
      updateSelectionOverlay(null, "hover");
    }
  }, [enabled, focusedId, hoveredId]);

  useEffect(() => {
    if (!enabled || !focusedId) return;
    if (lastScrolledFocusRef.current === focusedId) return;
    lastScrolledFocusRef.current = focusedId;

    const target = document.querySelector<HTMLElement>(`[data-section-id="${focusedId}"]`);
    target?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [enabled, focusedId]);

  useEffect(() => {
    if (!enabled) return;

    const onMiddlePanDown = (event: MouseEvent) => {
      if (event.button !== 1) return;
      event.preventDefault();
      window.parent.postMessage(
        { type: "ettajer:middle-pan", active: true, clientX: event.clientX, clientY: event.clientY },
        "*"
      );
    };

    const onMiddlePanUp = (event: MouseEvent) => {
      if (event.button !== 1) return;
      window.parent.postMessage({ type: "ettajer:middle-pan", active: false }, "*");
    };

    document.addEventListener("mousedown", onMiddlePanDown, true);
    document.addEventListener("mouseup", onMiddlePanUp, true);
    return () => {
      document.removeEventListener("mousedown", onMiddlePanDown, true);
      document.removeEventListener("mouseup", onMiddlePanUp, true);
    };
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;

    let overlayRaf = 0;
    const scheduleOverlay = () => {
      if (overlayRaf) return;
      overlayRaf = requestAnimationFrame(() => {
        overlayRaf = 0;
        const activeEl = focusedId
          ? document.querySelector<HTMLElement>(`[data-section-id="${focusedId}"]`)
          : null;
        const hoverEl =
          hoveredId && hoveredId !== focusedId
            ? document.querySelector<HTMLElement>(`[data-section-id="${hoveredId}"]`)
            : null;
        if (activeEl) updateSelectionOverlay(activeEl, "active");
        else if (hoverEl) updateSelectionOverlay(hoverEl, "hover");
      });
    };

    window.addEventListener("scroll", scheduleOverlay, true);
    window.addEventListener("resize", scheduleOverlay);
    return () => {
      window.removeEventListener("scroll", scheduleOverlay, true);
      window.removeEventListener("resize", scheduleOverlay);
      if (overlayRaf) cancelAnimationFrame(overlayRaf);
    };
  }, [enabled, focusedId, hoveredId]);

  useEffect(() => {
    if (!enabled) return;

    const onMessage = (event: MessageEvent) => {
      if (event.data?.type === "ettajer:focus-section" && typeof event.data.sectionId === "string") {
        lastScrolledFocusRef.current = null;
        setFocusedId(event.data.sectionId);
      }
      if (event.data?.type === "ettajer:drag-block") {
        dragBlockName.current = event.data.blockName ?? null;
      }
    };

    const onClick = (event: MouseEvent) => {
      if (dragActive.current) return;
      const target = event.target as HTMLElement | null;
      const section = target?.closest<HTMLElement>("[data-section-id]");
      if (!section) return;

      event.preventDefault();
      event.stopPropagation();

      const sectionId = section.getAttribute("data-section-id");
      if (!sectionId) return;

      setFocusedId(sectionId);
      window.parent.postMessage({ type: "ettajer:select-section", sectionId }, "*");
    };

    const flushSpacing = () => {
      spacingRaf.current = null;
      const next = pendingSpacing.current;
      if (next) showSpacingLabel(next.y, next.gap, next.x);
      else hideSpacingLabel();
    };

    const scheduleSpacing = (payload: { y: number; gap: number; x?: number } | null) => {
      pendingSpacing.current = payload;
      if (!spacingRaf.current) spacingRaf.current = requestAnimationFrame(flushSpacing);
    };

    const onMouseOver = (event: MouseEvent) => {
      if (dragActive.current) return;
      const target = event.target as HTMLElement | null;
      const section = target?.closest<HTMLElement>("[data-section-id]");
      const sectionId = section?.getAttribute("data-section-id") ?? null;
      setHoveredId(sectionId);
      window.parent.postMessage({ type: "ettajer:hover-section", sectionId }, "*");

      if (section && sectionId !== focusedId) {
        const next = section.nextElementSibling as HTMLElement | null;
        if (next?.hasAttribute("data-section-id")) {
          const gap = next.getBoundingClientRect().top - section.getBoundingClientRect().bottom;
          if (gap > 0) {
            const rect = section.getBoundingClientRect();
            scheduleSpacing({
              y: section.getBoundingClientRect().bottom + gap / 2,
              gap,
              x: rect.left + rect.width / 2,
            });
            return;
          }
        }
      }
      scheduleSpacing(null);
    };

    const onMouseOut = () => {
      if (!dragActive.current) scheduleSpacing(null);
    };

    const stopAutoScroll = () => {
      if (autoScrollRaf.current) {
        cancelAnimationFrame(autoScrollRaf.current);
        autoScrollRaf.current = null;
      }
    };

    const startAutoScroll = () => {
      stopAutoScroll();
      const tick = () => {
        autoScrollStep(pointerRef.current.x, pointerRef.current.y);
        autoScrollRaf.current = requestAnimationFrame(tick);
      };
      autoScrollRaf.current = requestAnimationFrame(tick);
    };

    const isBuilderDrag = (types: readonly string[]) =>
      types.includes(BUILDER_DRAG_MIME) || types.includes(COMPONENT_DRAG_MIME);

    const onDragEnter = (event: DragEvent) => {
      if (!event.dataTransfer || !isBuilderDrag(event.dataTransfer.types)) return;
      dragActive.current = true;
      window.parent.postMessage({ type: "ettajer:drag-active", active: true }, "*");
      startAutoScroll();
    };

    const onDragOver = (event: DragEvent) => {
      if (!event.dataTransfer || !isBuilderDrag(event.dataTransfer.types)) return;
      event.preventDefault();
      event.dataTransfer.dropEffect = "copy";

      pointerRef.current = { x: event.clientX, y: event.clientY };

      const index = getInsertIndexFromY(event.clientY);
      const zone = document.querySelector<HTMLElement>(`[data-drop-index="${index}"]`);
      document.querySelectorAll(".ettajer-builder-drop-zone").forEach((z) => {
        z.classList.remove("ettajer-builder-drop-zone-active");
      });
      zone?.classList.add("ettajer-builder-drop-zone-active");

      const zoneRect = zone?.getBoundingClientRect();
      const lineY = zoneRect ? zoneRect.top + zoneRect.height / 2 : event.clientY;
      showDropLine(
        lineY,
        zoneRect ? { left: zoneRect.left + 16, width: zoneRect.width - 32 } : undefined
      );

      if (zone) showDragPlaceholder(zone, dragBlockName.current);
      else hideDragPlaceholder();

      const spacing = spacingAtInsertIndex(index);
      if (spacing && spacing.gap > 0) {
        scheduleSpacing({ y: spacing.y, gap: spacing.gap, x: spacing.x });
      } else {
        scheduleSpacing(null);
      }

      const rects = collectSectionRects();
      const guides = computeSnapGuides(event.clientX, event.clientY, rects);
      renderSnapGuides(guides);

      window.parent.postMessage({ type: "ettajer:drag-insert", insertIndex: index }, "*");
    };

    const onDragLeave = (event: DragEvent) => {
      if (event.relatedTarget && document.contains(event.relatedTarget as Node)) return;
      hideDropLine();
      hideDragPlaceholder();
      scheduleSpacing(null);
      hideSnapGuides();
      document.querySelectorAll(".ettajer-builder-drop-zone").forEach((z) => {
        z.classList.remove("ettajer-builder-drop-zone-active");
      });
    };

    const onDrop = (event: DragEvent) => {
      if (!event.dataTransfer || !isBuilderDrag(event.dataTransfer.types)) return;
      event.preventDefault();
      const insertIndex = getInsertIndexFromY(event.clientY);
      dragActive.current = false;
      stopAutoScroll();
      hideDropLine();
      hideDragPlaceholder();
      hideSnapGuides();
      clearClasses();

      if (event.dataTransfer.types.includes(COMPONENT_DRAG_MIME)) {
        const componentId = event.dataTransfer.getData(COMPONENT_DRAG_MIME);
        window.parent.postMessage({ type: "ettajer:drop-component", componentId, insertIndex }, "*");
      } else {
        const blockId = event.dataTransfer.getData(BUILDER_DRAG_MIME);
        window.parent.postMessage({ type: "ettajer:drop-block", blockId, insertIndex }, "*");
      }
      window.parent.postMessage({ type: "ettajer:drag-active", active: false }, "*");
    };

    const onDragEnd = () => {
      dragActive.current = false;
      stopAutoScroll();
      hideDropLine();
      hideDragPlaceholder();
      scheduleSpacing(null);
      hideSnapGuides();
      clearClasses();
      window.parent.postMessage({ type: "ettajer:drag-active", active: false }, "*");
    };

    window.addEventListener("message", onMessage);
    document.addEventListener("click", onClick, true);
    document.addEventListener("mouseover", onMouseOver, true);
    document.addEventListener("mouseout", onMouseOut, true);
    document.addEventListener("dragenter", onDragEnter);
    document.addEventListener("dragover", onDragOver);
    document.addEventListener("dragleave", onDragLeave);
    document.addEventListener("drop", onDrop);
    document.addEventListener("dragend", onDragEnd);

    return () => {
      window.removeEventListener("message", onMessage);
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("mouseover", onMouseOver, true);
      document.removeEventListener("mouseout", onMouseOut, true);
      document.removeEventListener("dragenter", onDragEnter);
      document.removeEventListener("dragover", onDragOver);
      document.removeEventListener("dragleave", onDragLeave);
      document.removeEventListener("drop", onDrop);
      document.removeEventListener("dragend", onDragEnd);
      stopAutoScroll();
      if (spacingRaf.current) cancelAnimationFrame(spacingRaf.current);
      clearClasses();
      hideDropLine();
      hideSpacingLabel();
    };
  }, [enabled, focusedId]);

  const actionSectionId = hoveredId && hoveredId !== focusedId ? hoveredId : null;

  useEffect(() => {
    if (!enabled || !actionSectionId) return;
    const sectionEl = document.querySelector<HTMLElement>(`[data-section-id="${actionSectionId}"]`);
    const barEl = document.getElementById("ettajer-builder-action-bar");
    if (!sectionEl || !barEl) return;

    const update = () => {
      const rect = sectionEl.getBoundingClientRect();
      barEl.style.top = `${Math.max(8, rect.top + 8)}px`;
      barEl.style.left = `${rect.left + rect.width / 2}px`;
    };
    update();
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [enabled, actionSectionId]);

  if (!enabled || !actionSectionId) return null;

  const handleEdit = () => {
    setFocusedId(actionSectionId);
    window.parent.postMessage({ type: "ettajer:select-section", sectionId: actionSectionId }, "*");
  };

  return (
    <div
      id="ettajer-builder-action-bar"
      className="ettajer-builder-action-bar"
      style={{ position: "fixed", zIndex: 9999, transform: "translateX(-50%)" }}
    >
      <button type="button" onClick={handleEdit} className="ettajer-builder-action-btn">
        <Pencil className="h-3 w-3" />
        Edit section
      </button>
    </div>
  );
}
