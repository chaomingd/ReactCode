import { TComputed, TWatch } from '../type';

interface IComputedConfig<TState extends Record<string, any>> {
  prevState: TState;
  nextState: TState;
  computed?: TComputed<TState>;
}

export function calcDiffKeys(obj1: Record<string, any>, obj2: Record<string, any>) {
  const keys = Object.keys(obj2);
  const diffKeysMap: Record<string, boolean> = {};
  keys.forEach((key) => {
    if (obj1[key] !== obj2[key]) {
      diffKeysMap[key] = true;
    }
  });
  return diffKeysMap;
}

export function calcComputedState<TState extends Record<string, any>>({
  prevState,
  nextState,
  computed,
}: IComputedConfig<TState>) {
  if (computed) {
    computed.reduce((nextState, computedItem) => {
      const diffKeysMap = calcDiffKeys(prevState, nextState);
      let partialState;
      if (typeof computedItem === 'function') {
        partialState = computedItem(nextState, prevState);
      } else {
        if (computedItem.keys && computedItem.keys.some((key) => diffKeysMap[key])) {
          partialState = computedItem.hander(nextState, diffKeysMap, prevState);
        }
      }
      if (partialState) {
        Object.assign(nextState, partialState);
      }
      return nextState;
    }, nextState);
  }
  return nextState;
}

interface IWatchConfig<TState extends Record<string, any>> {
  prevState: TState;
  nextState: TState;
  watch?: TWatch<TState>;
}
export function execWatchHandler<TState extends Record<string, any>>({
  prevState,
  nextState,
  watch,
}: IWatchConfig<TState>) {
  const diffKeysMap = calcDiffKeys(prevState, nextState);
  if (watch) {
    watch.forEach((watchItem) => {
      if (watchItem.keys && watchItem.keys.some((key) => diffKeysMap[key])) {
        watchItem.hander && watchItem.hander(nextState, diffKeysMap, prevState);
      }
    });
  }
}
