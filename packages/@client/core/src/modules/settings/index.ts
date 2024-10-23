import type { ModuleStateFactoryFn } from '@client/shared';
import { createSettingsStore } from './store';
import type { ModuleSettings, ModuleSettingsStoreSchema } from './types';

export async function createSettings(state: ModuleStateFactoryFn<ModuleSettingsStoreSchema>): Promise<ModuleSettings> {
  const store = await createSettingsStore(state);

  return {
    store,
  };
}
