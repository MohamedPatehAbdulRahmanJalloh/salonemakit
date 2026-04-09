import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.salonemakit.app',
  appName: 'SaloneMakitSL',
  webDir: 'dist',
  server: {
    url: 'https://03bef03f-ed50-40a9-bfc0-5500cd196410.lovableproject.com?forceHideBadge=true',
    cleartext: false,
  },
  android: {
    buildOptions: {
      keystorePath: undefined,
      keystoreAlias: undefined,
    },
  },
  ios: {
    scheme: 'App',
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
  },
};

export default config;
