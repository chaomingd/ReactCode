
export function px(px: number) {
  if (window.innerWidth > 1920) {
    return Math.round(px / 1920 * window.innerWidth);
  }
  return px;
}
