import { useRef } from 'react';
import { useCreation } from './useCreation';
import { useLatest } from './useLatest';
import { useMemorizedFn } from './useMemorizedFn';
import { useUnMount } from './useUnMount';

export function useDebouncedFn(fn: Function, options?: { wait: number }) {
  const timerRef = useRef<any>();
  const fnRef = useLatest(fn);
  const run =  useCreation(() => {
    return (...args: any) => {
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        fnRef.current(...args);
      }, options?.wait || 500)
    }
  });
  const stop = useMemorizedFn(() => {
    clearTimeout(timerRef.current);
  })
  useUnMount(() => {
    stop();
  });
  return {
    run,
    stop,
  }
}
