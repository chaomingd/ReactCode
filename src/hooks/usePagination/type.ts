import { Nullable } from '@/types';
import { FormInstance } from 'antd';
import { DependencyList } from 'react';
import { IResponsiveConfigItem } from '../useResponsive';
import { Model } from '../react-store/useModel';

export type TMediaQueryItem = IResponsiveConfigItem<{
  col: number;
  row: number;
}>

export interface UsePaginationParams<TDataItem extends any = any> {
  // 默认数据
  defaultData?: TDataItem[];
  // 默认pageSize
  defaultPageSize?: number;
  // 默认的页码
  defaultCurrent?: number;
  // 依赖项，当依赖发生改变时，自动更新数据
  refreshDeps?: DependencyList;
  // 表单实例
  form?: FormInstance;
  // 是否手动调用更新函数，当设置为 false，更新数据需要手动调用 refresh
  manu?: boolean;
}

export interface IData<T> {
  totalCount: number;
  items: T[];
}

export type TService<
  TDataItem extends any = any,
  TFormValues extends Record<string, any> = Record<string, any>
> = (
  current: number,
  pageSize: number,
  formValues?: TFormValues
) => Promise<Nullable<IData<TDataItem>>>;

export interface fetchDataOptions {
  showLoading?: boolean;
}

export interface UsePaginationReturnValue<TDataItem extends any = any> {
  // 状态管理，一般无需使用，model.setState({}) 方法可更新数据
  model: Model<IUsePaginationState<TDataItem>, UsePaginationEffects>;
  // 列表数据
  items: TDataItem[];
  // loading 状态
  loading: boolean;
  // 分页属性，配合分页组件使用
  paginationProps: {
    current: number;
    pageSize: number;
    total: number;
    onChange: (current: number, pageSize: number) => void;
    pageSizeOptions: number[];
  };
  // 重新获取数据
  refresh: (options?: fetchDataOptions) => Promise<Nullable<IData<TDataItem>>>;
  // 重置表单
  reset: (options?: fetchDataOptions) => Promise<Nullable<IData<TDataItem>>>;
  // 表单搜索
  search: (options?: fetchDataOptions) => Promise<Nullable<IData<TDataItem>>>;
}

export interface UsePaginationReturnValueWidthResponsive<TDataItem extends any = any> extends UsePaginationReturnValue<TDataItem> {
  mediaQueryMatchedItem: TMediaQueryItem;
  matchMedia: () => void;
}
export interface UsePaginationReturnValueWidthListLayout<TDataItem extends any = any> extends UsePaginationReturnValue<TDataItem> {
  col: number;
  row: number;
}

export interface UsePaginationEffects<TDataItem extends any = any,> {
  fetchData: (options?: { showLoading?: boolean }) => Promise<Nullable<IData<TDataItem>>>;
}

export interface IUsePaginationState<TDataItem extends any = any> {
  items: TDataItem[];
  loading: boolean;
  current: number;
  pageSize: number;
  totalCount: number;
  pageSizeOptions: number[];
}
