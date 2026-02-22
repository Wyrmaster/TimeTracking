const HexToInt = (hex: string): number => parseInt(hex.slice(1), 16);
const IntToHex = (int: number): string => `#${int.toString(16).padStart(6, '0').toUpperCase()}`;

export {
  HexToInt,
  IntToHex
};