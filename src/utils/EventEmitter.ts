type IFunction = (...args: any) => void;

class EventEmitter<TEventName extends string = string> {
  _listeners = {} as Record<TEventName, IFunction[] | undefined>;
  on(type: TEventName, fn: IFunction) {
    if (!this._listeners[type]) {
      this._listeners[type] = [];
    }
    this._listeners[type]!.push(fn);
    return () => {
      this.off(type, fn);
    };
  }
  once(type: TEventName, fn: IFunction) {
    const off = this.on(type, (...args) => {
      fn(...args);
      off();
    });
  }
  emit(type: TEventName, ...args: any) {
    const listeners = this._listeners[type];
    if (!listeners || !listeners.length) return false;
    listeners.forEach((fn) => {
      fn(...args);
    });
    return true;
  }
  off(type: TEventName, fn: IFunction) {
    const listeners = this._listeners[type];
    if (!listeners || !listeners.length) return;
    if (!fn) {
      this._listeners[type] = undefined;
      return;
    }
    this._listeners[type] = listeners.filter((f) => f !== fn);
  }
  offAllListeners() {
    this._listeners = {} as Record<TEventName, IFunction[] | undefined>;
  }
}

export class EventEmitter2<Listeners extends Record<string, IFunction[]> = Record<string, IFunction[]>> extends EventEmitter {
  declare _listeners: Listeners;
  declare on: <Type extends keyof Listeners>(type: Type, fn: Listeners[Type][0]) => any;
  declare emit: <Type extends keyof Listeners>(type: Type, ...args: Parameters<Listeners[Type][0]>) => boolean;
}

export default EventEmitter;
