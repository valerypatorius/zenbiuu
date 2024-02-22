import { type ModuleEmotesStore, type ModuleEmotesStoreSchema } from './types';
import type ModuleStateFactoryFn from '@/entities/ModuleStateFactoryFn';
import { type EmoteEntity } from '@/entities/EmoteEntity';

export async function createEmotesStore(
  createState: ModuleStateFactoryFn<ModuleEmotesStoreSchema>,
): Promise<ModuleEmotesStore> {
  const { state, save } = await createState('store:emotes', {
    /**
     * @todo Do not keep in memory
     */
    emotesByChannelId: new Map(),
  });

  function addChannelEmotes(channelId: string, emotes: Record<string, EmoteEntity>): void {
    let storedEmotes = state.emotesByChannelId.get(channelId);

    if (storedEmotes === undefined) {
      storedEmotes = {};
      state.emotesByChannelId.set(channelId, storedEmotes);
    }

    Object.assign(storedEmotes, emotes);

    save();
  }

  return {
    get emotesByChannelId() {
      return state.emotesByChannelId;
    },
    addChannelEmotes,
  };
}
