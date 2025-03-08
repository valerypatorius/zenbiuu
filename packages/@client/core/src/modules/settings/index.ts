import type { ModuleStateFactoryFn, HubInterface } from '@client/shared';
import { createSettingsStore } from './store';
import type { ModuleSettings, ModuleSettingsStoreSchema } from './types';

export async function createSettings(
  state: ModuleStateFactoryFn<ModuleSettingsStoreSchema>,
  { hub }: { hub: HubInterface },
): Promise<ModuleSettings> {
  const store = await createSettingsStore(state);

  function setTheme(value: 'system' | 'dark' | 'light'): void {
    store.theme = value;

    hub.setThemeSource(value);
  }

  return {
    store,
    setTheme,
  };
}
