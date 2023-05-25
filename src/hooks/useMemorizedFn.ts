import { useRef } from 'react';
import { useLatest } from './useLatest';

export function useMemorizedFn<T extends Function>(fn: T) {
  const fnRef = useLatest(fn);
  const f = useRef<T>();
  if (!f.current) {
    (f.current as any) = (...args) => {
      fnRef.current(...args)
    }
  }
  return f.current as T;
}
