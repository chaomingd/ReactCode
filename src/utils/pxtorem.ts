
export function pxtorem(px: number, precision = 5) {
  return `${(px / 192).toFixed(precision)}rem`;
}
