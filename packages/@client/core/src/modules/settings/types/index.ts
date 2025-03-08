interface ModuleSettingsBool {
  isAudioCompressorEnabled: boolean;
  isCompactLayout: boolean;
  isSidebarEnabled: boolean;
  isSmoothScrollEnabled: boolean;
}

export interface ModuleSettingsStoreSchema extends ModuleSettingsBool {
  locale?: string;
  theme: 'system' | 'light' | 'dark';
}

export interface ModuleSettingsStore extends ModuleSettingsBool {
  locale?: string;
  theme: 'system' | 'light' | 'dark';
}

export interface ModuleSettings {
  readonly store: ModuleSettingsStore;
  setTheme: (value: 'system' | 'dark' | 'light') => void;
}
