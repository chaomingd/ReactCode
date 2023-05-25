interface IConfig {
  service: (...args: any[]) => any;
}
export function requestAnimationFrameThrottle({ service }: IConfig) {
  let cancelFrameId: number;
  return {
    run: (...args: any[]) => {
      if (cancelFrameId) return;
      cancelFrameId = window.requestAnimationFrame(() => {
        cancelFrameId = 0;
        service(...args);
      });
    },
    cancel: () => {
      window.cancelAnimationFrame(cancelFrameId);
    },
  };
}
