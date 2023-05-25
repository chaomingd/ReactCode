import { RefTarget } from '@/types';

export function getRefTarget(ref: RefTarget<HTMLElement>) {
  if (!ref) return null;
  if ('current' in ref) {
    return ref.current;
  }
  return ref;
}

export function setRefTarget(ref: any, target: any) {
  if (!ref) return;
  if (typeof ref === 'function') {
    ref(target);
  } else if (ref.current) {
    ref.current = target;
  }
}
