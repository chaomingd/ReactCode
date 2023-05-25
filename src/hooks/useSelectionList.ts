import { useState, useMemo } from 'react';
import { arrayToMap } from '@/utils/array';
import { useLatest } from 'ahooks';

interface IConfig<T = any> {
  dataList?: T[];
  listKey?: string;
  getKey?: (item: T) => string;
}
const DEFAULT_LIST_KEY = 'key';
export function useSelectionList<TData = any>({ dataList, listKey, getKey }: IConfig<TData>) {
  const [selectedKeys, changeSelectedListKeys] = useState<string[]>([]);
  const getKeyRef = useLatest(getKey);
  const selectedListData = useMemo(() => {
    if (!dataList || !dataList.length) {
      return {
        selectedKeys,
        selectedListKeys: [],
        selectedListItems: [],
        changeSelectedListKeys,
      };
    }
    const getKeyFunc = getKeyRef.current ? getKeyRef.current : (item) => item && item[listKey || DEFAULT_LIST_KEY];
    const listDatMap = arrayToMap(
      dataList,
      getKeyFunc,
    );
    const selectedListKeys: string[] = [];
    const selectedListItems: TData[] = [];
    selectedKeys.forEach((key) => {
      if (listDatMap[key]) {
        selectedListKeys.push(key);
        selectedListItems.push(listDatMap[key]);
      }
    });
    return {
      selectedKeys,
      selectedListKeys,
      selectedListItems,
      changeSelectedListKeys,
    };
  }, [dataList, listKey, getKeyRef, selectedKeys]);
  return selectedListData;
}
