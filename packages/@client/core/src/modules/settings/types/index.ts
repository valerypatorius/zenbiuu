interface ModuleSettingsBool {
  isAudioCompressorEnabled: boolean;
  isCompactLayout: boolean;
  isSidebarEnabled: boolean;
  isSmoothScrollEnabled: boolean;
}

export interface ModuleSettingsStoreSchema extends ModuleSettingsBool {}

export interface ModuleSettingsStore extends ModuleSettingsBool {}

export interface ModuleSettings {
  readonly store: ModuleSettingsStore;
}
