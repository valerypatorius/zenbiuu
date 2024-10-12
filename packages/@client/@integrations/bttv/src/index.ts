import {
  AbstractEmotesProvider,
  type EmoteEntity,
  type EmotesProviderApiInterface,
} from '@client/shared';
import { Transport } from '@client/transport';
import type { BTTVChannelEmotesResponse } from './types';

export default class BTTV
  extends AbstractEmotesProvider
  implements EmotesProviderApiInterface
{
  public static readonly name = 'bttv';

  protected readonly transport = new Transport({});

  public async getChannelEmotes(
    id: string,
  ): Promise<Record<string, EmoteEntity>> {
    const response = await this.transport.get<BTTVChannelEmotesResponse>(
      `https://api.betterttv.net/3/cached/users/twitch/${id}`,
    );

    return [...response.channelEmotes, ...response.sharedEmotes].reduce<
      Record<string, EmoteEntity>
    >((result, rawEmote) => {
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
