/**
 * Convert hexadecimal color code to integer representation.
 * @param hex Hexadecimal color code (e.g., "#FF0000").
 */
const HexToInt = (hex: string): number => parseInt(hex.slice(1), 16);

/**
 * Convert integer representation to hexadecimal color code.
 * @param int Integer representation of a color.
 * @constructor
 */
const IntToHex = (int: number): string => `#${int.toString(16).padStart(6, '0').toUpperCase()}`;

/**
 * Determines a readable text color for content placed on top of the given color.
 * @param int Integer representation of the background color.
 */
const IntToTextColor = (int: number): string => {
  const red: number = (int >> 16) & 0xFF;
  const green: number = (int >> 8) & 0xFF;
  const blue: number = int & 0xFF;

  // perceived brightness, see https://www.w3.org/TR/AERT/#color-contrast
  const brightness: number = (red * 299 + green * 587 + blue * 114) / 1000;

  return brightness > 140 ? '#101010' : '#FFFFFF';
};

export {
  HexToInt,
  IntToHex,
  IntToTextColor
};