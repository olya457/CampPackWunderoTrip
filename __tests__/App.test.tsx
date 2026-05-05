import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import App from '../App';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
}));

jest.mock('react-native-webview', () => {
  const ReactRuntime = require('react');
  const {View} = require('react-native');
  return {
    WebView: (props: object) => ReactRuntime.createElement(View, props),
  };
});

jest.mock('react-native-maps', () => {
  const ReactRuntime = require('react');
  const {View} = require('react-native');
  const MapView = (props: object) => ReactRuntime.createElement(View, props);
  const Marker = (props: object) => ReactRuntime.createElement(View, props);
  return {
    __esModule: true,
    default: MapView,
    Marker,
  };
});

test('renders correctly', async () => {
  jest.useFakeTimers();
  let renderer: ReactTestRenderer.ReactTestRenderer | undefined;

  await ReactTestRenderer.act(async () => {
    renderer = ReactTestRenderer.create(<App />);
    await Promise.resolve();
  });

  await ReactTestRenderer.act(async () => {
    renderer?.unmount();
  });

  jest.clearAllTimers();
  jest.useRealTimers();
});
