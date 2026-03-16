import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.salonemakit',
  appName: 'SaloneMakitSL',
  webDir: 'dist',
  server: {
    url: 'https://03bef03f-ed50-40a9-bfc0-5500cd196410.lovableproject.com?forceHideBadge=true',
    cleartext: true
  }
};

export default config;
