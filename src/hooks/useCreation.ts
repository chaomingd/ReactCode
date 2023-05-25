import { useRef } from 'react';


export function useCreation<T>(fn: () => T) {
  const ref = useRef<T>();
  if (!ref.current) {
    ref.current = fn();
  }
  return ref.current as T;
}
