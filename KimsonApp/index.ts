import 'react-native-gesture-handler';

// Enable comprehensive error logging
if (__DEV__) {
  // Log all unhandled promise rejections
  if (typeof global !== 'undefined') {
    const originalUnhandledRejection = global.onunhandledrejection;
    global.onunhandledrejection = (event: any) => {
      console.error('=== UNHANDLED PROMISE REJECTION ===');
      console.error('Reason:', event?.reason);
      console.error('Promise:', event?.promise);
      if (event?.reason) {
        console.error('Error message:', event.reason?.message);
        console.error('Error stack:', event.reason?.stack);
      }
      console.error('===================================');
      if (originalUnhandledRejection) {
        originalUnhandledRejection(event);
      }
    };
  }

  // Log all console warnings
  const originalWarn = console.warn;
  console.warn = (...args: any[]) => {
    originalWarn('=== CONSOLE WARNING ===');
    originalWarn(...args);
    originalWarn('======================');
  };
}
import { registerRootComponent } from 'expo';

import App from './App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
