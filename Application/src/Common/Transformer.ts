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

export {
  HexToInt,
  IntToHex
};