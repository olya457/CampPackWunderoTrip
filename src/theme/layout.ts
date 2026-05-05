import {Platform, StatusBar} from 'react-native';

export const androidEdge = 30;
export const iosTabBottom = 20;
export const androidTabBottom = 30;
export const tabBarHeight = 72;

export const topInset = Platform.OS === 'android' ? androidEdge : 0;
export const bottomInset = Platform.OS === 'android' ? androidEdge : iosTabBottom;
export const tabBottom = Platform.OS === 'android' ? androidTabBottom : iosTabBottom;

export const statusBarOffset =
  Platform.OS === 'android' ? StatusBar.currentHeight ?? 0 : 0;

export const pagePadding = (width: number) => {
  if (width < 350) {
    return 14;
  }
  if (width < 390) {
    return 18;
  }
  return 20;
};
