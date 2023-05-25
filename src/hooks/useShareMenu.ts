import Taro from '@tarojs/taro';
import { useEffect } from 'react';

export function useShareMenu() {
  useEffect(() => {
    Taro.showShareMenu({
      withShareTicket: true,
      showShareItems: ['wechatFriends', 'wechatMoment'],
    });
  }, [])
}
