import { MutableRefObject, useEffect, useRef } from 'react';
import EventEmitter from '@/utils/EventEmitter';
import { listen } from '@/utils/dom';
import styles from './useDragAndDrop.less';

const Signal = new EventEmitter();

type TEffect = 'disabled' | 'drop' | 'auto' | '';
interface IStore {
  data: Record<string, any>;
  container: HTMLDivElement | null;
  draging: boolean;
  enterDropArea: boolean;
  offset: {
    x: number;
    y: number;
  };
  effect: TEffect;
}

const store: IStore = getInitialStore();

function getInitialStore(): IStore {
  return {
    data: {},
    container: null,
    draging: false,
    enterDropArea: false,
    offset: {
      x: 0,
      y: 0,
    },
    effect: '',
  };
}

function resetStore() {
  Object.assign(store, getInitialStore());
}

function updateDragEffect(effect: TEffect) {
  if (effect === store.effect) return;
  store.effect = effect;
  const container = store.container;
  if (container) {
    container.setAttribute('effect', effect);
  }
}

export function setDragData(data: Record<string, any>) {
  Object.assign(store.data, data);
}

export function getDragData() {
  return { ...store.data };
}

function initContainer(options: IDragOptions) {
  if (!store.container) {
    store.container = document.createElement('div');
  }
  if (store.container.parentNode === document.body) return;
  let className = styles.dragItem;
  if (options.containerClassName) {
    className += ` ${options.containerClassName}`;
  }
  store.container.className = className;
  document.body.appendChild(store.container);
}

function addTargetCloneNode(dom: HTMLElement) {
  const node = dom.cloneNode(true) as HTMLElement;
  node.style.position = 'static';
  const rect = dom.getBoundingClientRect();
  store.container!.style.width = rect.width + 'px';
  store.container!.style.height = rect.height + 'px';
  store.container!.appendChild(node);
  return node;
}

function updateContainerPosition(e: MouseEvent, dom: HTMLElement) {
  const container = store.container!;
  const offset = store.offset;
  // container.style.left = e.clientX - offset.x + 'px';
  // container.style.top = e.clientY - offset.y + 'px';
  container.style.transform = `translate3d(${e.clientX - offset.x}px, ${e.clientY - offset.y}px, 0)`;
  if (isInDom(dom, e)) {
    updateDragEffect('auto');
  } else {
    if (!store.enterDropArea) {
      updateDragEffect('disabled');
    }
  }
}

function removeContainer() {
  if (store.container) {
    store.container.firstElementChild && store.container.removeChild(store.container.firstElementChild);
    store.container.parentNode?.removeChild(store.container);
    store.container = null;
  }
}

function setOffset(e, dom: HTMLElement | null) {
  if (!dom) return;
  const rect = dom.getBoundingClientRect();
  store.offset = {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top,
  };
}

type TDomRef = MutableRefObject<HTMLElement | null>;
interface ICallbackOptions {
  setDragData: typeof setDragData;
  updateDragEffect: typeof updateDragEffect;
  node: HTMLElement;
}
export interface IDragOptions {
  onDragStart?: (e: MouseEvent, options: ICallbackOptions) => void;
  onDragEnd?: (e: MouseEvent, options: ICallbackOptions) => void;
  key: string;
  containerClassName?: string;
}

export function handlerDragMouseDown(e, options: IDragOptions, dom: HTMLElement | null) {
  if (!dom) return;
  let move = false;
  let cloneNode: HTMLElement;
  initContainer(options);
  const SignalKey = options.key;
  setOffset(e, dom);
  const offMouseMove = listen(document, 'mousemove', (e: any) => {
    e.preventDefault();
    if (!move) {
      cloneNode = addTargetCloneNode(dom);
      options.onDragStart?.(e, {
        setDragData,
        updateDragEffect,
        node: cloneNode,
      });
      move = true;
      store.draging = true;
    } else {
      Signal.emit(`${SignalKey}-mousemove`, e);
    }
    updateContainerPosition(e, dom);
  });
  const offMouseUp = listen(document, 'mouseup', (e: any) => {
    e.preventDefault();
    offMouseMove();
    offMouseUp();
    if (move) {
      options.onDragEnd?.(e, {
        node: cloneNode,
        setDragData,
        updateDragEffect,
      });
      Signal.emit(`${SignalKey}-mouseup`, e);
    }
    updateDragEffect('auto');
    removeContainer();
    resetStore();
  });
}

interface IDropCallbackOptions {
  updateDragEffect: typeof updateDragEffect;
  getDragData: typeof getDragData;
}
export interface IDropOptions {
  key: string;
  onDragEnter?: (e, options: IDropCallbackOptions) => void;
  onDragLeave?: (e, options: IDropCallbackOptions) => void;
  onDragMove?: (e, options: IDropCallbackOptions) => void;
  onDrop?: (e, options: IDropCallbackOptions) => void;
  onValideDrop?: (e, options: IDropCallbackOptions) => boolean;
}

export function useDrag(domRef: TDomRef, options: IDragOptions) {
  const optionsRef = useRef<IDragOptions>(options);
  optionsRef.current = options;
  useEffect(() => {
    let offListen: Function;
    const dom = domRef.current;
    if (dom) {
      offListen = listen(dom, 'mousedown', (e) => {
        handlerDragMouseDown(
          e,
          {
            ...optionsRef.current,
          },
          dom,
        );
      });
    }
    return () => {
      offListen && offListen();
    };
  }, [domRef]);
}

export function useDrop(domRef: TDomRef, options: IDropOptions) {
  const optionsRef = useRef<IDropOptions>(options)
  useEffect(() => {
    const SignalKey = optionsRef.current.key;
    let isDragEnter = false;
    const callbackOptions = {
      updateDragEffect,
      getDragData,
    };
    const onMouseMove = (e) => {
      if (isInDom(domRef.current, e)) {
        if (!isDragEnter) {
          isDragEnter = true;
          optionsRef.current.onDragEnter?.(e, callbackOptions);
          store.enterDropArea = true;
          updateDragEffect('drop');
        }
        optionsRef.current.onDragMove?.(e, callbackOptions);
      } else {
        if (isDragEnter) {
          store.enterDropArea = false;
          isDragEnter = false;
          updateDragEffect('disabled');
          optionsRef.current.onDragLeave?.(e, callbackOptions);
        }
      }
    };
    const onMouseUp = (e) => {
      if (isInDom(domRef.current, e)) {
        let validate = true;
        if (optionsRef.current.onValideDrop) {
          validate = optionsRef.current.onValideDrop(e, callbackOptions);
        }
        if (validate) {
          optionsRef.current.onDrop?.(e, callbackOptions);
        }
      }
      store.enterDropArea = false;
    };
    Signal.on(`${SignalKey}-mousemove`, onMouseMove);
    Signal.on(`${SignalKey}-mouseup`, onMouseUp);
  }, [domRef]);
}

function isInDom(dom: HTMLElement | null, e: MouseEvent) {
  if (!dom) return false;
  const rect = dom.getBoundingClientRect();
  const clientX = e.clientX;
  const clientY = e.clientY;
  if (
    clientX < rect.left ||
    clientX > rect.left + rect.width ||
    clientY < rect.top ||
    clientY > rect.top + rect.height
  ) {
    return false;
  }
  return true;
}
