
const NUMBER_PRECISION = 1e-10;
const HIGN_PRECISION = Number.MIN_VALUE;
export function isNumberEqual(a: any, b: any, precision: 'low' | 'high' | number = 'low') {
  const minValue = typeof precision === 'number' ? precision : (precision === 'low' ? NUMBER_PRECISION : HIGN_PRECISION);
  if (typeof a === 'number' && typeof b === 'number') {
    return Math.abs(a - b) <= minValue;
  }
  return false;
}
