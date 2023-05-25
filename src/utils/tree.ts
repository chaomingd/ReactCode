import { Nullable } from '@/types';

interface ITreeOptions {
  children: string;
}

export function treeMap<T = any, R = any>(treeDatas: T[], interator: (item: T, index: number, parent: T | null, level: number) => R, options?: ITreeOptions) {
  const res: R[] = [];
  treeForEach(
    treeDatas,
    (item, index, parent, level) => {
      res.push(interator(item, index, parent, level));
    },
    options,
  );
  return res;
}

export function treeToMap<T = any>(treeDatas: Nullable<T[]>, getKey: (item: T, index: number, parent: T | null, level: number) => string, options?: ITreeOptions) {
  const map: Record<string, T> = {};
  if (!treeDatas) return {};
  treeForEach(treeDatas, (item, index, parent, level) => {
    map[getKey(item, index, parent, level)] = item;
  }, options);
  return map;
}

export function treeFilter<T = any>(treeDatas: T[], interator: (item: T, index: number, parent: T | null, level: number) => boolean, options?: ITreeOptions) {
  const res: T[] = [];
  treeForEach(
    treeDatas,
    (item, index, parent, level) => {
      if (interator(item, index, parent, level)) {
        res.push(item);
      }
    },
    options,
  );
  return res;
}

export function treeForEach<T = any>(treeDatas: T[], interator: (item: T, index: number, parent: T | null, level: number) => any, options?: ITreeOptions) {
  const childrenName = options?.children || 'children';
  let index = 0
  function walker(treeDatas: T[], parent: T | null, level = 0) {
    treeDatas &&
      treeDatas.length &&
      treeDatas.forEach((item) => {
        interator(item, index++, parent, level);
        if (item[childrenName] && item[childrenName].length) {
          walker(item[childrenName], item, level + 1);
        }
      });
  }
  walker(treeDatas, null);
}
