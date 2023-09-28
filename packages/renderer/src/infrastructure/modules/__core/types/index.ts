import { type AppLocaleName } from '@/src/infrastructure/i18n/types';

export interface AppStoreSchema {
  /** App locale */
  locale?: AppLocaleName;

  /** App settings, which can be toggled */
  settings: {
    /** True, if app window should be on top of the others */
    isAlwaysOnTop: boolean;

    /** True, if blur effects should be enabled */
    isBlurEnabled: boolean;
  };

  /** Interface size value in rem */
  interfaceSize: number;
}
