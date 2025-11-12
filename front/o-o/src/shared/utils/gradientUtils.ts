/**
 * Utility functions for creating gradient effects
 */

/**
 * Converts hex color to RGB values
 * @param hex - Hex color code (e.g., "#FFD0EA" or "FFD0EA")
 * @returns Object with r, g, b values
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const cleanHex = hex.replace('#', '');
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);
  return { r, g, b };
}

/**
 * Creates a radial gradient CSS string from a hex color
 * Gradient stops for compact, defined appearance:
 * - 0%: Full opacity center (100%)
 * - 25%: Still strong (75%)
 * - 50%: Gentle fade (40%)
 * - 70%: Fully transparent (0%) - compact edge
 *
 * @param hexColor - Hex color code (e.g., "#FFD0EA" or "FFD0EA")
 * @returns CSS radial-gradient string
 *
 * @example
 * createRadialGradient("#FFD0EA")
 * // Returns: "radial-gradient(circle at center, rgba(255, 208, 234, 1) 0%, rgba(255, 208, 234, 0.75) 25%, rgba(255, 208, 234, 0.4) 50%, rgba(255, 208, 234, 0) 70%)"
 */
export function createRadialGradient(hexColor: string): string {
  const { r, g, b } = hexToRgb(hexColor);

  return `radial-gradient(circle at center, rgba(${r}, ${g}, ${b}, 1) 0%, rgba(${r}, ${g}, ${b}, 0.75) 25%, rgba(${r}, ${g}, ${b}, 0.4) 50%, rgba(${r}, ${g}, ${b}, 0) 70%)`;
}
