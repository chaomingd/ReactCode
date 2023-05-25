import { Canvas } from '@tarojs/components';
import Taro, { CanvasContext, useReady } from '@tarojs/taro';
import { ReactNode, useEffect, useRef } from 'react';
import { Canvas as F2Canvas } from '@antv/f2';
import { useLatest } from '@/hooks/useLatest';
import './index.scss';

interface IProps {
  render: ReactNode;
  onReady?: (ctx: CanvasContext) => void;
  theme?: any;
}
let count = 0;
const F2 = ({ render, onReady, theme }: IProps) => {
  // @ts-ignore
  const data = render?.props?.data;
  const idRef = useRef<any>();
  const renderRef = useLatest(render);
  const f2CanvasRef = useRef<F2Canvas | null>(null);
  const canvasElRef = useRef<any>(null);
  const onReadyRef = useLatest(onReady);
  const dataRef = useRef<any>();
  if (!idRef.current) {
    idRef.current = `fs-canvas-${++count}`;
  }
  useEffect(() => {
    Taro.nextTick(() => {
      const query = Taro.createSelectorQuery();
      query
        .select(`#${idRef.current}`)
        .fields(
          {
            node: true,
            size: true,
          },
          (res) => {
            const { node, width, height } = res;
            const context = node.getContext('2d');
            const pixelRatio = Taro.getSystemInfoSync().pixelRatio;
            // 高清设置
            node.width = width * pixelRatio;
            node.height = height * pixelRatio;
            const children = renderRef.current;
            const canvas = new F2Canvas({
              pixelRatio: pixelRatio,
              width: width,
              height: height,
              context: context,
              children: children,
              theme: {
                ...(theme || {}),
                fontFamily: `PingFang SC, -apple-system, BlinkMacSystemFont, 
                'Segoe UI', Roboto, 'Helvetica Neue', Arial,
                'Noto Sans', sans-serif, 'Apple Color Emoji', 
                'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'`,
              },
            });
            canvas.render();
            f2CanvasRef.current = canvas;
            canvasElRef.current = canvas.canvas.get('el');
            onReadyRef.current?.(context);
          }
        )
        .exec();
    });
  }, []);
  useEffect(() => {
    if (data && dataRef.current === data) return;
    dataRef.current = data;
    if (f2CanvasRef.current && renderRef.current) {
      f2CanvasRef.current.update({
        children: renderRef.current,
      });
    }
  });
  const onClick = (e) => {
    var canvasEl = canvasElRef.current;
    if (!canvasEl) {
      return;
    }
    // 包装成 touch 对象
    e.touches = [e.detail];
    canvasEl.dispatchEvent('click', e);
  };
  const onTouchStart = (e) => {
    var canvasEl = canvasElRef.current;
    if (!canvasEl) {
      return;
    }
    canvasEl.dispatchEvent('touchstart', e);
  };
  const onTouchMove = (e) => {
    var canvasEl = canvasElRef.current;
    if (!canvasEl) {
      return;
    }
    canvasEl.dispatchEvent('touchmove', e);
  };
  const onTouchEnd = (e) => {
    var canvasEl = canvasElRef.current;
    if (!canvasEl) {
      return;
    }
    canvasEl.dispatchEvent('touchend', e);
  };
  return (
    <Canvas
      type="2d"
      id={idRef.current}
      canvasId={idRef.current}
      className="f2-canvas"
      onClick={onClick}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onTouchCancel={onTouchEnd}
    ></Canvas>
  );
};

export default F2;
