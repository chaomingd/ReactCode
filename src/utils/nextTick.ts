
export function nextTick(fn: (...args: any[]) => any) {
  Promise.resolve().then(fn);
}
