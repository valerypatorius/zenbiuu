import type { ModuleStateFactoryFn } from '@client/shared';
import type { ModuleSettingsStore, ModuleSettingsStoreSchema } from './types';

export async function createSettingsStore(
  createState: ModuleStateFactoryFn<ModuleSettingsStoreSchema>,
): Promise<ModuleSettingsStore> {
  const { state, save } = await createState('store:settings', {
    isAudioCompressorEnabled: false,
    isCompactLayout: true,
    isSidebarEnabled: true,
    isSmoothScrollEnabled: false,
    locale: undefined,
  });

  return {
    get isAudioCompressorEnabled() {
      return state.isAudioCompressorEnabled;
    },
    set isAudioCompressorEnabled(value) {
      state.isAudioCompressorEnabled = value;

      save();
    },
    get isCompactLayout() {
      return state.isCompactLayout;
    },
    set isCompactLayout(value) {
      state.isCompactLayout = value;

      save();
    },
    get isSidebarEnabled() {
      return state.isSidebarEnabled;
    },
    set isSidebarEnabled(value) {
      state.isSidebarEnabled = value;

      save();
    },

    get isSmoothScrollEnabled() {
      return state.isSmoothScrollEnabled;
    },

    set isSmoothScrollEnabled(value) {
      state.isSmoothScrollEnabled = value;

      save();
    },

    get locale() {
      return state.locale;
    },
    set locale(value) {
      state.locale = value;

      save();
    },
  };
}