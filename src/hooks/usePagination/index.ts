import { useLatest } from 'ahooks';
import { Model, createAsyncEffect, useModel } from '../react-store/useModel';
import {
  TService,
  UsePaginationEffects,
  TMediaQueryItem,
  UsePaginationParams,
  UsePaginationReturnValue,
  UsePaginationReturnValueWidthResponsive,
  IUsePaginationState,
  UsePaginationReturnValueWidthListLayout
} from './type';
import { useResponsive } from '../useResponsive';
import { useEffect } from 'react';
import { DEFAULT_PAGE_SIZE, DEFAULT_PAGE_SIZE_OPTIONS } from './constant';
import { UseListLayoutConfig, useListLayout } from '../useListLayout';
import { gerationPageSizeOptions } from './utils';

export function usePagination<
  TDataItem extends any = any,
  TFormValues extends Record<string, any> = Record<string, any>
>(service: TService<TDataItem, TFormValues>, params?: UsePaginationParams) {
  const serviceRef = useLatest(service);
  const paramsRef = useLatest(params);
  const model: Model<IUsePaginationState<TDataItem>, UsePaginationEffects> = useModel<
    IUsePaginationState<TDataItem>,
    UsePaginationEffects
  >({
    state: {
      items: params?.defaultData || [],
      current: params?.defaultCurrent || 1,
      pageSize: params?.defaultPageSize || DEFAULT_PAGE_SIZE,
      loading: false,
      totalCount: 0,
      pageSizeOptions: DEFAULT_PAGE_SIZE_OPTIONS,
    },
    effects: {
      fetchData: createAsyncEffect(
        async () => {
          const form = paramsRef.current?.form;
          const { current, pageSize } = model.getState();
          if (!pageSize) return null;
          const res = await serviceRef
            .current(current, pageSize, form ? form.getFieldsValue() : {})
            .catch((err) => console.log(err));
          if (res) {
            return {
              items: res.items || [],
              totalCount: res.totalCount || 0
            };
          }
        },
        {
          loadingKey: 'loading'
        }
      )
    }
  });
  useEffect(() => {
    if (paramsRef.current?.manu !== true) {
      model.getEffect('fetchData')();
    }
  }, params?.refreshDeps || []);
  const state = model.useGetState();

  const returnValue: UsePaginationReturnValue = {
    model,
    items: state.items,
    loading: state.loading,
    refresh: (options) => {
      return model.getEffect('fetchData')(options);
    },
    search: (options) => {
      model.setState({
        current: 1,
      }, {
        silent: true,
      });
      return model.getEffect('fetchData')(options);
    },
    reset: (options) => {
      model.setState(
        {
          current: 1,
        },
        {
          silent: true
        }
      );
      const form = paramsRef.current?.form;
      if (form) {
        form.resetFields();
      }
      return model.getEffect('fetchData')(options);
    },
    paginationProps: {
      current: state.current,
      pageSize: state.pageSize,
      pageSizeOptions: state.pageSizeOptions,
      total: state.totalCount,
      onChange: (current, pageSize) => {
        model.setState(
          {
            current,
            pageSize
          },
          {
            silent: true
          }
        );
        model.getEffect('fetchData')();
      }
    }
  };
  return returnValue;
}

export function usePaginationWithResponsive<
  TDataItem extends any = any,
  TFormValues extends Record<string, any> = Record<string, any>
>(
  service: TService<TDataItem, TFormValues>,
  params: UsePaginationParams & { mediaQuery: TMediaQueryItem[] }
) {
  const paginationValue = usePagination<TDataItem, TFormValues>(
    service,
    params
  ) as UsePaginationReturnValueWidthResponsive<TDataItem>;
  const { mediaQueryMatchedItem, matchMedia } = useResponsive({
    mediaQuery: params.mediaQuery,
    onChange: (mediaQueryMatchedItem) => {
      const pageSize = mediaQueryMatchedItem.data.col * mediaQueryMatchedItem.data.row;
      const pageSizeOptions = gerationPageSizeOptions(pageSize);
      paginationValue.model.setState({
        pageSizeOptions,
        pageSize,
      }, {
        silent: true,
      });
      paginationValue.refresh();
    }
  });
  paginationValue.mediaQueryMatchedItem = mediaQueryMatchedItem!;
  paginationValue.matchMedia = matchMedia;
  return paginationValue;
}

/**
 * 列表布局
*/
export function usePaginationWithListLayout<
  TDataItem extends any = any,
  TFormValues extends Record<string, any> = Record<string, any>
>(
  service: TService<TDataItem, TFormValues>,
  params: UsePaginationParams & {
    listLayoutConfig: UseListLayoutConfig & { row?: number }
  }
) {
  const paginationValue = usePagination<TDataItem, TFormValues>(
    service,
    {...(params || {}), manu: true}
  ) as UsePaginationReturnValueWidthListLayout<TDataItem>;
  const listLayout = useListLayout(params.listLayoutConfig);
  const row = Math.max(params.listLayoutConfig.row || 0, listLayout.row);
  useEffect(() => {
    if (row) {
      const pageSize = row * listLayout.col;
      const pageSizeOptions = gerationPageSizeOptions(pageSize);
      paginationValue.model.setState({
        pageSizeOptions,
        pageSize,
      }, {
        silent: true,
      });
      paginationValue.refresh();
    }
  }, [listLayout, ...(params.refreshDeps || [])]);
  Object.assign(paginationValue, listLayout);
  paginationValue.row = row
  return paginationValue;
}
