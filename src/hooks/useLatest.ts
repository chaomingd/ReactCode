import { useRef } from 'react';

export function useLatest<T extends any>(val: T) {
  const ref = useRef<T>(val);
  ref.current = val
  return ref;
}
