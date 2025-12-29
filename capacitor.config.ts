import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.reactsprings.caas',
  appName: 'CaaS',
  webDir: 'dist',

  // Deep links for Web3Auth redirect
  server: {
    androidScheme: 'https',
  },

  plugins: {
    App: {
      // Android App Links
    },
  },

  // iOS URL schemes
  ios: {
    scheme: 'caas',
  },
};

export default config;
