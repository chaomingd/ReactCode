import { makePromiseTimeoutFinally } from '@/utils/makePromiseTimeoutFinally';
import { useEffect, useRef } from 'react';
import { createAsyncEffect, Model, useModel } from './react-store/useModel';
import { useLatest } from './useLatest';

interface IState<TDataItem extends any = any> {
  data: TDataItem[] | null;
  loading: boolean;
  hasMore: boolean;
  pageNum: number;
  pageSize: number;
  refresherTriggered: boolean;
  error: boolean;
}

interface IEffects {
  fetchData: (options?: { reset?: boolean }) => Promise<Partial<IState>>;
}

type TService<TDataItem extends any> = (
  state: IState,
  ...args: any
) => Promise<{
  pageSize: number;
  pageNum: number;
  pages: number;
  total: number;
  rows?: TDataItem[];
} | null>;
export function useInfiniteScroll<TDataItem extends any = any>(
  service: TService<TDataItem>,
  options?: {
    defaultPageSize?: number;
    defaultPageNum?: number;
    autoRequest?: boolean;
    deps?: any[];
  }
) {
  const optionsRef = useLatest(options);
  const serviceRef = useLatest(service);
  const lastDataLengthRef = useRef<number>(0);
  const model: Model<IState<TDataItem>, IEffects> = useModel<
    IState<TDataItem>,
    IEffects
  >({
    state: {
      data: null,
      loading: true,
      hasMore: true,
      pageSize: options?.defaultPageSize || 10,
      pageNum: options?.defaultPageNum || 1,
      refresherTriggered: true,
      error: false,
    },
    effects: {
      fetchData: createAsyncEffect(
        (options, ...args) => {
          return serviceRef
            .current(model.getState(), ...args)
            .then((res) => {
              if (res && typeof res === 'object') {
                const { data: oldData } = model.getState();
                const resData = res.rows;
                const newState: Partial<IState<TDataItem>> = {
                  hasMore: res.pageNum < res.pages,
                  error: false,
                };
                lastDataLengthRef.current = resData?.length || 0;
                if (resData) {
                  if (options?.reset) {
                    newState.data = resData;
                  } else {
                    newState.data = [...(oldData || []), ...resData];
                  }
                }
                return newState;
              }
              return {
                data: null,
                hasMore: true,
                error: false,
              };
            })
            .catch(() => {
              return {
                error: true,
              };
            });
        },
        { loadingKey: 'loading' }
      ),
    },
  });
  const state = model.useGetState();
  const onScrollToLower = () => {
    const { pageNum, hasMore, loading, error } = state;
    if (!hasMore || loading || error) return;
    model.setState(
      {
        pageNum: pageNum + 1,
      },
      {
        silent: true,
      }
    );
    model.getEffect('fetchData')();
  };
  const hidePullDownLoading = () => {
    model.setState({
      refresherTriggered: false,
    });
  };
  const onRefresherRefresh = () => {
    model.setState(
      {
        pageNum: 1,
        hasMore: true,
        refresherTriggered: true,
      },
      {
        silent: true,
      }
    );
    makePromiseTimeoutFinally(
      model.getEffect('fetchData')({
        reset: true,
      }),
      () => {
        model.setState({
          refresherTriggered: false,
        });
      },
      800
    );
  };
  const refresh = (options?: { showPullDownLoading?: boolean }) => {
    model.setState(
      {
        pageNum: 1,
        hasMore: true,
        refresherTriggered:
          options?.showPullDownLoading !== false ? true : false,
      },
      {
        silent: true,
      }
    );
    const promise = model.getEffect('fetchData')({
      reset: true,
    });
    makePromiseTimeoutFinally(
      promise,
      () => {
        model.setState({
          refresherTriggered: false,
        });
      },
      800
    );
    return promise;
  };
  const fetchData = () => {
    const { pageNum, pageSize } = model.getState();
    model.setState(
      {
        pageNum: 1,
        pageSize: pageNum * pageSize,
      },
      {
        silent: true,
      }
    );
    model.getEffect('fetchData')({
      reset: true,
    });
    model.setState(
      {
        pageNum,
        pageSize,
      },
      {
        silent: true,
      }
    );
  };
  const isFirstRef = useRef<any>(true);
  useEffect(() => {
    if (isFirstRef.current && optionsRef.current?.autoRequest === false) {
      isFirstRef.current = false;
      return;
    }
    isFirstRef.current = false;
    model.getEffect('fetchData')();
  }, options?.deps || []);
  return {
    onScrollToLower,
    onRefresherRefresh,
    refresh,
    state,
    model,
    fetchData,
    hidePullDownLoading,
  };
}
