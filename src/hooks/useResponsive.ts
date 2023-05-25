import { isSameObject } from '@/utils/object';
import { MutableRefObject, useRef, useState } from 'react';
import { useEffectWithTarget } from './useEffectWithTarget';
import { useLatest, useMemoizedFn } from 'ahooks';
import { listen } from '@/utils/dom';
import { resizeObserver } from '@/utils/resize';

export interface IResponsiveConfigItem<TData = any> {
  key: string;
  minWidth?: number;
  maxWidth?: number;
  data: TData;
  [key: string]: any;
}

export interface IUseResponseParams<TData = any> {
  mediaQuery?: Array<IResponsiveConfigItem<TData>>;
  onChange?: (item: IResponsiveConfigItem<TData>) => void;
  enable?: boolean;
  containerRef?: MutableRefObject<HTMLElement | null>;
}
/**
 * @examples
 * ```ts
  // window resize
  const { matchedItem } = useResponsive({
    mediaQuery: [
      { key: 'small', maxWidth: 760 },
      { key: 'middle', minWidth: 761, maxWidth: 1440 },
      { key: 'big', minWidth: 1441 }
    ],
    onChange: (matchedItem) => {}
  });
  // dom resize
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { matchedItem } = useResponsive({
    containerRef,
    mediaQuery: [
      { key: 'small', maxWidth: 760 },
      { key: 'middle', minWidth: 761, maxWidth: 1440 },
      { key: 'big', minWidth: 1441 }
    ],
    onChange: (matchedItem) => {}
  });
 * ```
*/

export function useResponsive<TData = any>(params: IUseResponseParams<TData>) {
  const [mediaQueryMatchedItem, setMatchedItem] = useState<IResponsiveConfigItem<TData> | null>(null);
  const paramsRef = useLatest(params);
  const currDataRef = useRef<IResponsiveConfigItem<TData> | null>(null);
  const matchMedia = useMemoizedFn(() => {
    if (!paramsRef.current!.enable || !paramsRef.current.mediaQuery) return;
    let width: number;
    if (params.containerRef?.current) {
      width = params.containerRef.current.getBoundingClientRect().width;
    } else {
      width = window.innerWidth;
    }
    const mediaQuery = paramsRef.current!.mediaQuery;
    let matchItem: IResponsiveConfigItem<TData> | null = null;
    if (mediaQuery) {
      for (let i = 0; i < mediaQuery.length; i++) {
        const item = mediaQuery[i];
        if (width >= (item.minWidth || 0) && width <= (item.maxWidth || Infinity)) {
          matchItem = item;
          break;
        }
      }
      if (!matchItem) {
        matchItem = mediaQuery[0];
      }
      if (matchItem && !isSameObject(currDataRef.current as any, matchItem)) {
        currDataRef.current = matchItem;
        setMatchedItem(matchItem);
        paramsRef.current!.onChange?.(matchItem);
      }
    }
  });
  useEffectWithTarget(() => {
    matchMedia();
    let offResize: Function;
    if (params.containerRef?.current) {
      offResize = resizeObserver({
        el: params.containerRef.current!,
        onResize: matchMedia,
      })
    } else {
      offResize = listen(window, 'resize', matchMedia);
    }
    return () => {
      offResize();
    };
  }, params.containerRef, [], true);
  return {
    mediaQueryMatchedItem,
    matchMedia,
  };
}
