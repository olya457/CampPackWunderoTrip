import React from 'react';
import {ImageBackground, StatusBar, StyleSheet, Text, View} from 'react-native';
import {WebView} from 'react-native-webview';
import {assets} from '../assets';
import {colors} from '../theme/colors';

const loaderHtml = `
<!doctype html>
<html>
<head>
<meta name="viewport" content="initial-scale=1, width=device-width" />
<style>
html, body {
  background: transparent;
  height: 100%;
  margin: 0;
  overflow: hidden;
}
.wrap {
  align-items: center;
  display: flex;
  height: 100%;
  justify-content: center;
  width: 100%;
}
.ring {
  animation: spin 1.4s linear infinite;
  border-radius: 50%;
  height: 48px;
  position: relative;
  width: 48px;
}
.ring::before, .ring::after {
  border: 3px solid #ff4b14;
  border-left-color: transparent;
  border-right-color: transparent;
  border-radius: 50%;
  content: "";
  inset: 0;
  position: absolute;
}
.ring::after {
  animation: pulse 1.1s ease-in-out infinite;
  inset: 8px;
}
.diamond {
  animation: float 1.1s ease-in-out infinite;
  background: #ff4b14;
  height: 22px;
  left: 23px;
  position: absolute;
  top: 13px;
  transform: rotate(45deg);
  width: 22px;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
@keyframes pulse {
  50% { opacity: .35; transform: scale(.82); }
}
@keyframes float {
  50% { transform: translateY(-2px) rotate(45deg); }
}
</style>
</head>
<body>
  <div class="wrap">
    <div class="ring"><div class="diamond"></div></div>
  </div>
</body>
</html>
`;

export const SplashScreen = () => (
  <ImageBackground source={assets.splashBackground} resizeMode="cover" style={styles.root}>
    <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
    <View style={styles.center}>
      <WebView
        originWhitelist={['*']}
        source={{html: loaderHtml}}
        style={styles.webView}
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        androidLayerType="software"
        containerStyle={styles.webContainer}
      />
    </View>
    <Text style={styles.footer}>EXPLORE · PACK · DISCOVER</Text>
  </ImageBackground>
);

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    backgroundColor: colors.background,
    flex: 1,
    justifyContent: 'center',
  },
  center: {
    alignItems: 'center',
    height: 96,
    justifyContent: 'center',
    width: 96,
  },
  webContainer: {
    backgroundColor: 'transparent',
  },
  webView: {
    backgroundColor: 'transparent',
    height: 96,
    width: 96,
  },
  footer: {
    bottom: 34,
    color: colors.blue,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 2,
    position: 'absolute',
  },
});
