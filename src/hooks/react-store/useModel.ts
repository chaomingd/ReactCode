import { arrayToMap } from '@/utils/array';
import { shallowEqualKeys } from '@/utils/object';
import { uuid } from '@/utils/uuid';
import { useCreation, useLatest } from 'ahooks';
import { useEffect, useRef, useState } from 'react';
import { TEqualityFn, TWatch, TComputed, IDispatchOptions } from './type';
import { calcComputedState, execWatchHandler } from './utils';

type TSubscribeFunc<
  TState extends Record<string, any> = Record<string, any>,
  TEffects extends Record<string, any> = Record<string, any>,
  UserData extends Record<string, any> = Record<string, any>
> = (state: Model<TState, TEffects, UserData>) => any;

interface IEffects {
  [key: string]: ((...args: any[]) => any) | any;
}

const DEFAULT_SUBSCRIBE_NAME = 'reactStoreSubscribe';

export interface IModelConfig<
  TState extends Record<string, any> = Record<string, any>,
  TEffects extends IEffects = IEffects,
  UserData extends Record<string, any> = Record<string, any>
> {
  state: TState;
  effects?: Partial<TEffects>;
  onStateChange?: (prevState: TState, currentState: TState) => any;
  modifyState?: (prevState: TState, nextState: TState) => Partial<TState> | null;
  watch?: TWatch<TState>;
  computed?: TComputed<TState>;
  userData?: UserData;
  name?: string;
}
export class Model<
  TState extends Record<string, any> = Record<string, any>,
  TEffects extends IEffects = IEffects,
  UserData extends Record<string, any> = Record<string, any>
> {
  isUnMount = false;
  name?: string;
  state: TState;
  _userData: UserData;
  _effects = {} as TEffects;
  _preState: TState;
  _dispatchSignal: string = '';
  _subscribes: Record<string, Array<TSubscribeFunc<TState, TEffects, UserData>>> = {};
  constructor(public config: IModelConfig<TState, TEffects, UserData>) {
    this.state = this.getActualState({} as TState, config.state || {});
    this._preState = {...this.state};
    this._userData = config?.userData || ({} as UserData);
    if (config.effects) {
      this.setEffects(config.effects);
    }
    if (config.name) {
      this.name = config.name;
    }
  }
  subscribe(func: TSubscribeFunc<TState, TEffects, UserData>, name?: string) {
    const subscribeName = this.getSubscribeName(name);
    if (!this._subscribes[subscribeName]) {
      this._subscribes[subscribeName] = [];
    }
    this._subscribes[subscribeName].push(func);
    return () => {
      this.unsubscribe(func, name);
    };
  }
  getSubscribeName(name?: string) {
    return name || DEFAULT_SUBSCRIBE_NAME;
  }
  unsubscribe(func: TSubscribeFunc<TState, TEffects, UserData>, name?: string) {
    const subscribeName = this.getSubscribeName(name);
    if (this._subscribes[subscribeName] && this._subscribes[subscribeName].length) {
      this._subscribes[subscribeName] = this._subscribes[subscribeName].filter((fn) => fn !== func);
    }
  }
  getUserData() {
    return { ...this._userData };
  }
  setUserData(userData: Partial<UserData>) {
    Object.assign(this._userData, userData);
  }
  setState(state: Partial<TState>, options?: IDispatchOptions) {
    if (state) {
      this._preState = {...this.state};
      this.state = this.getActualState(this._preState, state);
      this.config.onStateChange && this.config.onStateChange(this._preState, this.getState());
      if (options?.silent !== true) {
        this.dispatch(options);
      }
    }
  };
  getActualState(prevState: TState, payload: Partial<TState>) {
    let nextState = { ...prevState, ...payload };
    const { modifyState, watch, computed } = this.config || {};
    let partialState;
    if (modifyState) {
      partialState = modifyState(prevState, nextState);
      if (partialState && typeof partialState === 'object') {
        Object.assign(nextState, partialState);
      }
    }
    // 处理计算属性
    nextState = calcComputedState<TState>({
      prevState,
      nextState,
      computed
    });
    // 执行 watch
    execWatchHandler({
      prevState,
      nextState,
      watch
    });
    return nextState;
  }
  getState() {
    return this.state;
  }
  dispatch(options?: IDispatchOptions) {
    if (this.isUnMount) return;
    let subscribeNames = Object.keys(this._subscribes);
    if (options) {
      if (options.include) {
        const includeNameMap = arrayToMap(options.include);
        subscribeNames = subscribeNames.filter((name) => includeNameMap[name]);
      }
      if (options.exclude) {
        const excludeNameMap = arrayToMap(options.exclude);
        subscribeNames = subscribeNames.filter((name) => !excludeNameMap[name]);
      }
    }
    this._dispatchSignal = uuid();
    subscribeNames.forEach((subscribeName) => {
      if (this._subscribes[subscribeName]) {
        this._subscribes[subscribeName].forEach((func) => func(this));
      }
    });
  }
  setEffect<M extends TEffects[keyof TEffects]>(name: keyof TEffects, effect: M) {
    if (this._effects[name] !== effect) {
      this._effects[name] = typeof effect === 'function' ? effect.bind(this) : effect;
    }
  }
  setEffects(effects: Partial<TEffects>) {
    Object.keys(effects).forEach((name) => {
      this.setEffect(name, effects[name]!);
    });
  }
  getEffect<Name extends keyof TEffects>(name: Name) {
    return this._effects[name];
  }
  dispose() {
    this._effects = {} as TEffects;
    this.state = {} as TState;
  }
  useSelector = (equalityFn?: TEqualityFn<TState>, name?: string) => {
    // eslint-disable-next-line
    const [_, forceUpdate] = useState({});
    const unmountRef = useRef(false);
    const equalityFnRef = useRef(equalityFn);
    equalityFnRef.current = equalityFn;
    useEffect(() => {
      unmountRef.current = false;
      const unsubscribe = this.subscribe(() => {
        if (!unmountRef.current) {
          let shouldUpdate = true;
          if (
            equalityFnRef.current &&
            equalityFnRef.current({ ...this._preState }, this.getState())
          ) {
            shouldUpdate = false;
          }
          shouldUpdate && forceUpdate({});
        }
      }, name);
      return () => {
        unmountRef.current = true;
        unsubscribe();
      };
      // eslint-disable-next-line
    }, []);
    return [this.getState()];
  };
  useGetState = <Key extends keyof TState & string>(
    keys?: Key[],
    equalityFn?: TEqualityFn<TState>
  ) => {
    const state = this.useSelector((prevState, nextState) => {
      if (keys && shallowEqualKeys(prevState, nextState, keys)) {
        return true;
      }
      if (equalityFn && equalityFn(prevState, nextState)) {
        return true;
      }
      return false;
    });
    return state[0];
  };
  useUpdate = <Key extends keyof TState & string>(
    keys?: Key[],
    equalityFn?: TEqualityFn<TState>
  ) => {
    this.useGetState(keys, equalityFn);
  }
  subscribeWithKeys<Key extends keyof TState & string>(
    func: TSubscribeFunc<TState, TEffects>,
    options: { keys?: Key[]; equalityFn?: TEqualityFn<TState>; name?: string }
  ) {
    const { keys, equalityFn, name } = options;
    return this.subscribe(() => {
      const nextState = this.getState();
      if (keys && shallowEqualKeys(this._preState, nextState, keys)) {
        return;
      }
      if (equalityFn && equalityFn(this._preState, nextState)) {
        return;
      }
      func(this);
    }, name);
  }
  useSubscribe = <Key extends keyof TState & string>(func: TSubscribeFunc<TState, TEffects>, options?: { keys?: Key[]; equalityFn?: TEqualityFn<TState>; name?: string; forceUpdate?: boolean }) => {
    const unmountRef = useRef(false);
    const funcRef = useLatest(func);
    // eslint-disable-next-line
    const [_, forceUpdate] = useState({});
    const optionsRef = useLatest(options);
    const needDispatchRef = useRef(false);
    useEffect(() => {
      unmountRef.current = false;
      funcRef.current(this);
      const unsubscribe = this.subscribeWithKeys(() => {
        if (!unmountRef.current) {
          needDispatchRef.current = true;
          if (optionsRef.current?.forceUpdate !== false) {
            forceUpdate({});
          }
        }
      }, options || {});
      return () => {
        unmountRef.current = true;
        unsubscribe();
      };
      // eslint-disable-next-line
    }, []);
    useEffect(() => {
      if (needDispatchRef.current) {
        funcRef.current(this)
        needDispatchRef.current = false;
      }
    }, [this._dispatchSignal])
  }
}

export function useModel<
  TState extends Record<string, any>,
  TEffects extends IEffects = IEffects,
  UserData extends Record<string, any> = Record<string, any>
>(modelConfig: IModelConfig<TState, TEffects, UserData>) {
  const model = useCreation(() => {
    return new Model<TState, TEffects, UserData>(modelConfig);
  }, []);
  model.config = modelConfig;
  if (modelConfig.effects) {
    model.setEffects(modelConfig.effects);
  }
  useEffect(() => {
    model.isUnMount = false;
    return () => {
      model.isUnMount = true;
    };
  }, [model]);
  return model as Model<TState, TEffects, UserData>;
}

interface ICreateAsyncEffectOptions {
  showLoading?: boolean;
  [key: string]: any;
}
type TSyncEffectArgs<Args extends [ICreateAsyncEffectOptions?, ...any[]]> = Args;
export function createAsyncEffect<EffectHandler extends (options?: { showLoading: boolean }, ...args: any[]) => Promise<any>>(
  effectHandler: EffectHandler,
  config: { loadingKey: string }
) {
  return function (this: any, ...args: TSyncEffectArgs<Parameters<EffectHandler>>) {
    const options = args[0];
    const loadingKey = config?.loadingKey || 'loading';
    const showLoading = options?.showLoading;
    const model: Model & {
      [key: string]: any;
    } = this as any as Model;
    if (showLoading !== false) {
      model.setState({
        [loadingKey]: true
      });
    }
    const fetchCountKey = `${loadingKey}-count`;
    if (model[fetchCountKey] === undefined) {
      model[fetchCountKey] = -1;
    }
    const fetchCount = ++model[fetchCountKey];
    return effectHandler(...args)
      .then((data) => {
        if (fetchCount !== model[fetchCountKey]) return data;
        let nextState: Record<string, any> = {}
        if (showLoading !== false) {
          nextState[loadingKey] = false;
        }
        if (data && typeof data === 'object') {
          Object.assign(nextState, data)
        }
        model.setState(nextState);
        return data;
      })
      .catch((e) => {
        if (showLoading !== false) {
          model.setState({
            [loadingKey]: false
          });
        }
        throw e;
      });
  } as EffectHandler;
}

export function createEqualityFn(keys?: string[]) {
  return (prevState: Record<string, any>, nextState: Record<string, any>) => shallowEqualKeys(prevState, nextState, keys);
}
