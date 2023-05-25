import ResizeObserver from 'resize-observer-polyfill';

interface IResizeObserverParam {
  el: HTMLElement;
  onResize?: (size: { width: number; height: number; top: number; left: number; right: number; bottom: number }) => void;
}
export function resizeObserver(props: IResizeObserverParam) {
  const { el, onResize } = props;
  const rb = new ResizeObserver((entries) => {
    entries.forEach((entry) => {
      const rect = entry.target.getBoundingClientRect();
      onResize && onResize(rect);
    });
  });
  if (el) {
    rb.observe(el);
  }
  return () => {
    rb.disconnect();
  };
}
