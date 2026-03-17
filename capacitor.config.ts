import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.03bef03fed5040a9bfc05500cd196410',
  appName: 'salonemakit',
  webDir: 'dist',
  server: {
    url: 'https://03bef03f-ed50-40a9-bfc0-5500cd196410.lovableproject.com?forceHideBadge=true',
    cleartext: true,
  },
  android: {
    buildOptions: {
      keystorePath: undefined,
      keystoreAlias: undefined,
    },
  },
  ios: {
    scheme: 'SaloneMakitSL',
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
  },
};

export default config;
