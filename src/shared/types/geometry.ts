/**
 * Represents a 2-D point with horizontal and vertical coordinates.
 *
 * Commonly used for:
 * - Screen / viewport positions (e.g. a floating widget's placement)
 * - Mouse / pointer event coordinates (e.g. `MouseEvent.clientX` / `clientY`)
 * - Drag-offset calculations
 */
export interface Position {
  /** Horizontal coordinate in pixels, measured from the left. */
  x: number;
  /** Vertical coordinate in pixels, measured from the top. */
  y: number;
}
