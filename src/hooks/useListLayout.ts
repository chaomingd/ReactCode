import { useLatest, useUnmount } from 'ahooks';
import { useEffectWithTarget } from './useEffectWithTarget';
import { MutableRefObject, useRef } from 'react';
import { listen } from '@/utils/dom';
import { resizeObserver } from '@/utils/resize';
import { px } from '@/utils/px';
import { useModel } from './react-store/useModel';

export interface UseListLayoutConfig {
  containerRef?: MutableRefObject<HTMLElement | null>;
  baseWidth: number;
  baseHeight?: number;
  gap?: number | [number, number];
  onChange?: (state: IState) => any;
}

function getCount(base: number, gap: number, length: number) {
  let count = Math.floor(length / base);
  while (count) {
    if (count * base + gap * (count - 1) <= length) break;
    count--;
  }
  return count;
}
interface IState {
  col: number;
  row: number;
}
export function useListLayout(config: UseListLayoutConfig) {
  const configRef = useLatest(config);
  const timerRef = useRef<any>();
  const model = useModel<IState>({
    state: {
      col: 0,
      row: 0
    }
  });
  const layoutState = model.useGetState();
  useEffectWithTarget(() => {
    let offResize: Function;
    const onResize = () => {
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        const { gap, baseHeight, baseWidth } = configRef.current;
        let width: number;
        let height: number;
        if (config.containerRef?.current) {
          width = config.containerRef.current.offsetWidth;
          height = config.containerRef.current.offsetHeight;
        } else {
          width = window.innerWidth;
          height = window.innerHeight;
        }
        let colGap = 0;
        let rowGap = 0;
        if (gap) {
          if (Array.isArray(gap)) {
            colGap = px(gap[0]);
            rowGap = px(gap[1]);
          } else {
            colGap = rowGap = px(gap);
          }
        }
        let newState: Record<string, number> = {};
        const col = getCount(px(baseWidth), colGap, width);
        newState.col = col;
        newState.row = 0;
        if (baseHeight) {
          const row = getCount(px(baseHeight), rowGap, height) + 1;
          newState.row = row;
        }
        const oldState = model.getState();
        if (newState.col === oldState.col && newState.row === oldState.row) return;
        model.setState(newState);
        configRef.current.onChange?.(model.getState());
      }, 17);
    };
    onResize();
    if (config.containerRef?.current) {
      offResize = resizeObserver({
        el: config.containerRef.current,
        onResize
      });
    } else {
      offResize = listen(window, 'resize', onResize);
    }
    return () => {
      offResize();
    };
  }, config.containerRef);
  useUnmount(() => {
    clearTimeout(timerRef.current)
  })
  return layoutState;
}
