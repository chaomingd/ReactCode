import { getScrollBarSize } from './scrollBar';

/**
 * 监听dom事件
 */
export function listen(dom: Element | Document | Window, eventName: string, handleEventFunc: (e: any) => any, eventOptions = {}) {
  if (!dom) throw new Error('dom is required');
  if (!handleEventFunc) throw new Error('eventHandle is required');
  dom.addEventListener(eventName, handleEventFunc, eventOptions);
  return () => {
    dom.removeEventListener(eventName, handleEventFunc, eventOptions);
  };
}

export function getScrollContainer(target: Element) {
  let node: HTMLElement | null = target as HTMLElement;
  while (node) {
    const computedStyle = window.getComputedStyle(node);
    const overflow = computedStyle.overflow;
    const overflowX = computedStyle.overflowX;
    const overflowY = computedStyle.overflowY;
    const scrollOverFlowValues = [overflow, overflowX, overflowY];
    if (node === document.body) return node;
    const isScrollNode = ['auto', 'scroll'].some((overflowValue) => {
      return scrollOverFlowValues.includes(overflowValue);
    });
    if (isScrollNode) return node;
    node = node.parentNode as HTMLElement;
  }
  return null;
}

export function getScrollLeft(target: HTMLElement) {
  if (target === document.body) {
    return Math.max(document.body.scrollLeft, document.documentElement.scrollLeft);
  } else {
    return target.scrollLeft;
  }
}
export function getScrollTop(target: HTMLElement) {
  if (target === document.body) {
    return Math.max(document.body.scrollTop, document.documentElement.scrollTop);
  } else {
    return target.scrollTop;
  }
}

export function getBoundingClientRectWithScrollBar(target: HTMLElement) {
  if (target === document.body) {
    return {
      top: 0,
      left: 0,
      width: Math.min(document.body.offsetWidth, document.documentElement.offsetWidth),
      height: Math.min(document.body.offsetHeight, document.documentElement.offsetHeight),
    };
  }
  const rect = target.getBoundingClientRect();
  return {
    width: target.offsetWidth,
    height: target.offsetHeight,
    top: rect.top,
    left: rect.left,
  };
}

export function getScrollRect(target: HTMLElement) {
  if (target === document.body) {
    return {
      scrollWidth: Math.min(document.body.scrollWidth, document.documentElement.scrollWidth),
      scrollHeight: Math.min(document.body.scrollHeight, document.documentElement.scrollHeight),
    };
  }
  return {
    scrollWidth: target.scrollWidth,
    scrollHeight: target.scrollHeight,
  };
}

export function scrollTo(target: HTMLElement, options?: ScrollOptions & { top?: number; left: number }) {
  if (target === document.body) {
    window.scrollTo(options);
  } else {
    target.scrollTo(options);
  }
}

const scrollBarSize = getScrollBarSize();

/**
 * 原生的scrollIntoView有些bug
 */
export function scrollIntoView(
  target: Element,
  options?: { offsetLeft?: number; offsetTop?: number },
) {
  const scrollContainer = getScrollContainer(target);
  if (scrollContainer) {
    const targetRect = target.getBoundingClientRect();
    const scrollContainerRect = getBoundingClientRectWithScrollBar(scrollContainer);
    const scrollLeft = getScrollLeft(scrollContainer);
    const scrollTop = getScrollTop(scrollContainer);
    // 相对于滚动容器的相对位置
    const positionX = targetRect.left - scrollContainerRect.left;
    const positionY = targetRect.top - scrollContainerRect.top;
    // 相对于滚动容器的绝对位置
    const absoluteX = positionX + scrollLeft;
    const absoluteY = positionY + scrollTop;
    const scrollOptions: Record<string, any> = {};
    let offsetLeft = options?.offsetLeft || 0;
    let offsetTop = options?.offsetTop || 0;
    offsetLeft += scrollBarSize.width;
    offsetTop += scrollBarSize.height;
    const { scrollHeight, scrollWidth } = getScrollRect(scrollContainer);
    // 最大滚动距离
    const maxScrollLeft = scrollWidth - scrollContainerRect.width + scrollBarSize.width;
    const maxScrollTop = scrollHeight - scrollContainerRect.height + scrollBarSize.height;
    if (positionX >= scrollContainerRect.width - targetRect.width - scrollBarSize.width) {
      scrollOptions.left = Math.max(
        0,
        Math.min(absoluteX - scrollContainerRect.width + targetRect.width + offsetLeft, maxScrollLeft),
      );
    }
    if (positionX < 0) {
      scrollOptions.left = Math.max(0, Math.min(scrollLeft + positionX, maxScrollLeft));
    }
    if (positionY >= scrollContainerRect.height - targetRect.height - scrollBarSize.height) {
      scrollOptions.top = Math.max(
        0,
        Math.min(absoluteY - scrollContainerRect.height + targetRect.height + offsetTop, maxScrollTop),
      );
    }
    if (positionY < 0) {
      scrollOptions.top = Math.max(0, Math.min(scrollTop + positionY, maxScrollTop));
    }
    scrollTo(scrollContainer, scrollOptions as any);
  }
}
