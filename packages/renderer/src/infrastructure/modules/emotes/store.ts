import { type ModuleEmotesStoreSchema } from './types';
import type ModuleStateFactoryFn from '@/entities/ModuleStateFactoryFn';
import { type EmoteEntity } from '@/entities/EmoteEntity';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export async function createEmotesStore (createState: ModuleStateFactoryFn<ModuleEmotesStoreSchema>) {
  const { state, save } = await createState('store:emotes', {
    emotesByChannelId: {},
  });

  function getEmotesByChannelId (): Record<string, Record<string, EmoteEntity>> {
    return state.emotesByChannelId;
  }

  function addChannelEmotes (channelId: string, emotes: Record<string, EmoteEntity>): void {
    if (!(channelId in state.emotesByChannelId)) {
      state.emotesByChannelId[channelId] = {};
    }

    Object.assign(state.emotesByChannelId[channelId], emotes);

    save();
  }

  return {
    getEmotesByChannelId,
    addChannelEmotes,
  };
}
