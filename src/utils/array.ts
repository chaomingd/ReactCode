// 在数组中使用 keys 搜索
export function findItemInArrWithKeys<T = any>(arr: Array<Record<string, any>>, keys: string[], key = 'key') {
  const map: Record<string, any> = {};
  const result: T[] = [];
  if (!arr || !arr.length) return result;
  arr.forEach((item) => {
    map[item[key]] = item;
  });
  keys.forEach((key) => {
    if (map[key]) {
      result.push(map[key]);
    }
  });
  return result;
}

// 数组转对象
export function arrayToMap<T = any, GetValue extends (item: T) => any = () => T>(
  arr: T[],
  getKey?: (item: T) => string,
  getValue?: GetValue) {
  const map: Record<string, ReturnType<GetValue>> = {};
  const _getValue = getValue || ((item: T) => item);
  const _getKey = getKey || ((item) => item);
  if (!arr) return map;
  arr.forEach((item) => {
    map[_getKey(item) as string] = _getValue(item);
  });
  return map;
}

interface IDuplicateRemovalOptions {
  cover?: boolean;
}
// 去重
export function duplicateRemoval<T = any>(
  arr: T[],
  getKey?: (item: T) => string | number,
  options: IDuplicateRemovalOptions = {},
) {
  if (!getKey) {
    // eslint-disable-next-line
    getKey = (key) => key as string;
  }
  const map: Record<string, T> = {};
  const res: T[] = [];
  const firstItemMap: Record<string, T> = {};
  const keys: Array<string | number> = [];
  arr.forEach((item) => {
    const key = getKey!(item);
    if (!map[key]) {
      if (!options.cover) {
        res.push(item);
      } else {
        keys.push(key);
        firstItemMap[key] = item;
      }
      map[key] = item;
    } else if (options.cover) {
      map[key] = item;
    }
  });
  if (options.cover) {
    return keys.map((key) => ({ firstItem: firstItemMap[key], data: map[key] }));
  }
  return res;
}

// 分组
export function groupBy<T = any>(arr: T[], getKey: (item: T) => string | number) {
  const map: Record<string, T[]> = {};
  const keys: Array<string | number> = [];
  arr.forEach((item) => {
    const key = getKey(item);
    if (!map[key]) {
      map[key] = [item];
      keys.push(key);
    } else {
      map[key].push(item);
    }
  });
  return {
    keys,
    map,
  };
}

/**
 * [0 0 0 0 0 0 0 0]
 * [1 0 0 1 1 0 0 1 0]
 * [
 *  { start: 0, end: 0 },
 *  { start: 3, end: 4 },
 *  { start: 7, end: 8 }
 * ]
 * */

type TDiffRange = Array<{ start: number; end: number }>;
export function diffArray(arr1: any[], arr2: any[]) {
  const len1 = arr1.length;
  const len2 = arr2.length;
  let diffIndexes: number[] | null = [];
  let index = 0;
  while (index < len1 && index < len2) {
    if (arr1[index] !== arr2[index]) {
      diffIndexes.push(index);
    }
    index++;
  }
  while (index < len2) diffIndexes.push(index++);
  const diffRange: TDiffRange = [];
  if (!diffIndexes.length) return diffRange;
  index = diffIndexes[0];
  diffRange.push({
    start: index,
    end: index,
  });
  diffIndexes.forEach((i) => {
    if (index !== i) {
      diffRange.push({
        start: i,
        end: i,
      });
      index = i + 1;
    } else {
      diffRange[diffRange.length - 1].end = index++;
    }
  });
  diffIndexes = null;
  return diffRange;
}

type TInterator<T = any> = (item: T, index: number, arr: T[]) => any;
export function forEach<T = any>(arr: T[], interator: TInterator<T>, options?: { start?: number; end?: number }) {
  let start = 0;
  let end = arr.length;
  if (options) {
    start = Math.max(options.start || 0, 0);
    end = Math.min(options.end || arr.length, arr.length);
  }
  for (let i = start; i < end; i++) {
    interator(arr[i], i, arr);
  }
}

export function rebuildArrayWithDiffRange<T = any>(arr: T[], diffRange: TDiffRange) {
  let start = 0;
  const res: Array<{ diff: boolean; rangeData: T[] }> = [];
  diffRange.forEach((diffRangeItem) => {
    if (start < diffRangeItem.start) {
      const noDiffRangeData: T[] = [];
      forEach(arr, (item) => noDiffRangeData.push(item), {
        start,
        end: diffRangeItem.start,
      });
      res.push({
        diff: false,
        rangeData: noDiffRangeData,
      });
    }
    if (diffRangeItem.end < arr.length) {
      const diffRangeData: T[] = [];
      forEach(arr, (item) => diffRangeData.push(item), {
        start: diffRangeItem.start,
        end: diffRangeItem.end + 1,
      });
      res.push({
        diff: true,
        rangeData: diffRangeData,
      });
      start = diffRangeItem.end + 1;
    }
  });
  if (start < arr.length) {
    const noDiffRangeData: T[] = [];
    forEach(arr, (item) => noDiffRangeData.push(item), {
      start,
    });
    res.push({
      diff: false,
      rangeData: noDiffRangeData,
    });
  }
  return res;
}

export function arrayFill<Item = any>(len: number, fillFn: (index: number) => Item) {
  const res: Item[] = [];
  for (let i = 0; i < len; i++) {
    res.push(fillFn(i));
  }
  return res;
}

export function isSameArr<T1 extends any, T2 extends any>(arr1?: T1[], arr2?: T2[], equalityFn?: (item1: T1, item2: T2) => boolean) {
  if (!arr1 || !arr2) return false;
  if (arr1.length !== arr2.length) return false;
  // eslint-disable-next-line
  equalityFn = equalityFn || ((item1, item2) => (item1 as any) === item2);
  for (let i = 0; i < arr1.length; i++) {
    // @ts-ignore ...
    if (!equalityFn(arr1[i], arr2[i])) return false;
  }
  return true;
}

export function ensureArray<T extends any>(obj: T | T[]) {
  if (Array.isArray(obj)) {
    return obj as T[];
  }
  return [obj] as T[];
}
