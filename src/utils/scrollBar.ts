// For Modal scrollBar hidden
let scrollWidth: number;
let scrollHeight: number;
export function getScrollBarSize() {
  if (scrollWidth !== undefined) {
    return {
      width: scrollWidth,
      height: scrollHeight,
    };
  }
  const inner = document.createElement('div');
  inner.style.width = '100%';
  inner.style.height = '100%';

  const outer = document.createElement('div');
  const outerStyle = outer.style;

  outerStyle.position = 'absolute';
  outerStyle.top = '0';
  outerStyle.left = '0';
  outerStyle.pointerEvents = 'none';
  outerStyle.visibility = 'hidden';
  outerStyle.width = '200px';
  outerStyle.height = '200px';
  outerStyle.overflow = 'hidden';

  outer.appendChild(inner);

  document.body.appendChild(outer);

  const widthContainedWidth = inner.offsetWidth;
  const widthContainedHeight = inner.offsetHeight;
  outer.style.overflow = 'scroll';
  let widthScrollWidth = inner.offsetWidth;
  let widthScrollHeight = inner.offsetHeight;

  if (widthContainedWidth === widthScrollWidth) {
    widthScrollWidth = outer.clientWidth;
  }
  if (widthContainedHeight === widthScrollHeight) {
    widthScrollHeight = outer.clientHeight;
  }

  document.body.removeChild(outer);

  scrollWidth = widthContainedWidth - widthScrollWidth;
  scrollHeight = widthContainedWidth - widthScrollHeight;
  return {
    width: scrollWidth,
    height: scrollHeight,
  };
}
