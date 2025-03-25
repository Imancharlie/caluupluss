import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.caluu.app',
  appName: 'CALUU',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  android: {
    buildOptions: {
      keystorePath: 'caluu.keystore',
      keystoreAlias: 'caluu',
      keystorePassword: 'caluu123',
      keyPassword: 'caluu123'
    }
  }
};

export default config;
