/** Canvas interaction helpers — zoom lerp, snap detection, auto-scroll */

export const SNAP_THRESHOLD = 6;
export const AUTO_SCROLL_EDGE = 56;
export const AUTO_SCROLL_SPEED = 14;
export const ZOOM_LERP = 0.18;
export const PAN_LERP = 0.22;

export function lerp(current: number, target: number, factor: number): number {
  return current + (target - current) * factor;
}

export function nearlyEqual(a: number, b: number, epsilon = 0.002): boolean {
  return Math.abs(a - b) < epsilon;
}

export interface RectSnapshot {
  id: string;
  left: number;
  right: number;
  top: number;
  bottom: number;
  centerX: number;
  centerY: number;
  width: number;
  height: number;
}

export function collectSectionRects(): RectSnapshot[] {
  return Array.from(document.querySelectorAll<HTMLElement>("[data-section-id]")).map((el) => {
    const rect = el.getBoundingClientRect();
    return {
      id: el.getAttribute("data-section-id") ?? "",
      left: rect.left,
      right: rect.right,
      top: rect.top,
      bottom: rect.bottom,
      centerX: rect.left + rect.width / 2,
      centerY: rect.top + rect.height / 2,
      width: rect.width,
      height: rect.height,
    };
  });
}

export interface SnapLine {
  axis: "x" | "y";
  position: number;
  label?: string;
}

/** Basic center/edge snap guides for section drag insertion */
export function computeSnapGuides(
  pointerX: number,
  pointerY: number,
  rects: RectSnapshot[]
): SnapLine[] {
  const guides: SnapLine[] = [];
  const viewportCenterX = window.innerWidth / 2;

  const xCandidates = [viewportCenterX, ...rects.flatMap((r) => [r.left, r.centerX, r.right])];
  for (const x of xCandidates) {
    if (Math.abs(pointerX - x) <= SNAP_THRESHOLD) {
      guides.push({
        axis: "x",
        position: x,
        label: Math.abs(x - viewportCenterX) < 1 ? "center" : undefined,
      });
      break;
    }
  }

  const yCandidates = rects.flatMap((r) => [r.top, r.centerY, r.bottom]);
  for (const y of yCandidates) {
    if (Math.abs(pointerY - y) <= SNAP_THRESHOLD) {
      guides.push({ axis: "y", position: y });
      break;
    }
  }

  return guides;
}

export function edgeScrollDelta(
  clientX: number,
  clientY: number,
  container?: HTMLElement | null
): { dx: number; dy: number } {
  const rect =
    container?.getBoundingClientRect() ??
    ({ top: 0, left: 0, bottom: window.innerHeight, right: window.innerWidth } as DOMRect);

  let dx = 0;
  let dy = 0;

  if (clientY < rect.top + AUTO_SCROLL_EDGE) dy = -AUTO_SCROLL_SPEED;
  else if (clientY > rect.bottom - AUTO_SCROLL_EDGE) dy = AUTO_SCROLL_SPEED;

  if (clientX < rect.left + AUTO_SCROLL_EDGE) dx = -AUTO_SCROLL_SPEED;
  else if (clientX > rect.right - AUTO_SCROLL_EDGE) dx = AUTO_SCROLL_SPEED;

  return { dx, dy };
}

export function autoScrollStep(clientX: number, clientY: number, container?: HTMLElement | null) {
  const { dx, dy } = edgeScrollDelta(clientX, clientY, container);

  if (dx || dy) {
    if (container) {
      container.scrollTop += dy;
      container.scrollLeft += dx;
    } else {
      window.scrollBy(dx, dy);
    }
  }

  return { dx, dy };
}

/** Pan the canvas transform when dragging near viewport edges (parent editor shell). */
export function canvasEdgePanStep(
  clientX: number,
  clientY: number,
  viewportRect: DOMRect,
  panBy: (dx: number, dy: number) => void
) {
  let dx = 0;
  let dy = 0;

  if (clientY < viewportRect.top + AUTO_SCROLL_EDGE) dy = AUTO_SCROLL_SPEED;
  else if (clientY > viewportRect.bottom - AUTO_SCROLL_EDGE) dy = -AUTO_SCROLL_SPEED;

  if (clientX < viewportRect.left + AUTO_SCROLL_EDGE) dx = AUTO_SCROLL_SPEED;
  else if (clientX > viewportRect.right - AUTO_SCROLL_EDGE) dx = -AUTO_SCROLL_SPEED;

  if (dx || dy) panBy(dx, dy);
}
