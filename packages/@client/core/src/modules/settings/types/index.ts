interface ModuleSettingsBool {
  isAudioCompressorEnabled: boolean;
  isCompactLayout: boolean;
  isSidebarEnabled: boolean;
  isSmoothScrollEnabled: boolean;
}

export interface ModuleSettingsStoreSchema extends ModuleSettingsBool {
  locale?: string;
}

export interface ModuleSettingsStore extends ModuleSettingsBool {
  locale?: string;
}

export interface ModuleSettings {
  readonly store: ModuleSettingsStore;
}
