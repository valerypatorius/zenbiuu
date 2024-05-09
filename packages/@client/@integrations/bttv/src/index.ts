import AbstractProvider from '../AbstractProvider';
import { type BTTVChannelEmotesResponse } from './types';
import type EmotesProviderApiInterface from '@/interfaces/EmotesProviderApi.interface';
import { type EmoteEntity } from '@/entities/EmoteEntity';

export default class FFZ extends AbstractProvider implements EmotesProviderApiInterface {
  public async getChannelEmotes(id: string): Promise<Record<string, EmoteEntity>> {
    const response = await this.transport.get<BTTVChannelEmotesResponse>(
      `https://api.betterttv.net/3/cached/users/twitch/${id}`,
    );

    return [
      ...response.channelEmotes,
      ...response.sharedEmotes,
    ].reduce<Record<string, EmoteEntity>>((result, rawEmote) => {
      /**
       * @todo Improve ofc
       */
      result[rawEmote.code] = {
        '1.0x': `https://cdn.betterttv.net/emote/${rawEmote.id}/1x`,
        '2.0x': `https://cdn.betterttv.net/emote/${rawEmote.id}/2x`,
        '3.0x': `https://cdn.betterttv.net/emote/${rawEmote.id}/3x`,
      };

      return result;
    }, {});
  }
}
