
export function setDomPositionRelative(el: HTMLElement) {
  const position = getComputedStyle(el).getPropertyValue('position');
  if (['fixed', 'absolute', 'relative'].includes(position)) return;
  el.classList.add('position-relative'); // style positon: relative from global.less;
}
