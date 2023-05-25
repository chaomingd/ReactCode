import { isSameArr } from '@/utils/array';
import { isDefined } from '@/utils/bool';
import { useUnmount } from 'ahooks';
import { MutableRefObject, useEffect, useRef } from 'react';

export function useEffectWithTarget(
  effect: () => any,
  targetRef?: MutableRefObject<any> | Array<MutableRefObject<any>> | null,
  deps?: any[],
  strict = false,
) {
  const lastDepsRef = useRef<any>();
  const lastElementRef = useRef<any>();
  const lastEffectReturnRef = useRef<any>();
  const clearEffect = () => {
    if (lastEffectReturnRef.current && typeof lastEffectReturnRef.current === 'function') {
      lastEffectReturnRef.current();
    }
  };
  useEffect(() => {
    const currentTarget = (Array.isArray(targetRef) ? targetRef.map((ref) => ref.current) : targetRef ? [targetRef.current] : []).filter(
      (el) => isDefined(el),
    );
    if (
      !isSameArr(lastElementRef.current, currentTarget) ||
      (lastDepsRef.current && deps && !isSameArr(lastDepsRef.current, deps))
    ) {
      lastElementRef.current = currentTarget;
      lastDepsRef.current = deps;
      clearEffect();
      if (strict) {
        currentTarget.length && (lastEffectReturnRef.current = effect());
      } else {
        lastEffectReturnRef.current = effect();
      }
    }
  });
  useUnmount(() => {
    lastElementRef.current = undefined;
    clearEffect();
  });
}
