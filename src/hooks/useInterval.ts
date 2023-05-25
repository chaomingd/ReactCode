import { useEffect, useRef } from 'react';
import { useLatest } from './useLatest';
import { useMemorizedFn } from './useMemorizedFn';

export function useInterval(fn: Function, wait: number) {
  const fnRef = useLatest(fn);
  const timerRef = useRef<any>()
  useEffect(() => {
    timerRef.current = setInterval(() => {
      fnRef.current()
    }, wait)
    return () => {
      clearInterval(timerRef.current)
    }
  }, [])
  return useMemorizedFn(() => {
    clearInterval(timerRef.current)
  })
}
