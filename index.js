import { AppRegistry } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import App from './src/App';
// import StorybookUIRoot from './storybook';

// Should we show storybook instead of our app?
//
// ⚠️ Leave this as `false` when checking into git.
// const SHOW_STORYBOOK = true;
//
// const RootComponent = SHOW_STORYBOOK && __DEV__ ? StorybookUIRoot : App;
// AppRegistry.registerComponent('BidFood', () => RootComponent);

// Register background handler
messaging().setBackgroundMessageHandler(async remoteMessage => {
    // console.log('Message handled in the background!', remoteMessage);
  });
AppRegistry.registerComponent('BidFood', () => App);