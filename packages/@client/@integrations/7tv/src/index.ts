import { type SevenTvChannelEmotesResponse } from './types';
import { EmotesProviderApiInterface, type EmoteEntity, AbstractEmotesProvider } from '@client/shared';
import { Transport } from '@client/transport';

export default class SevenTv extends AbstractEmotesProvider implements EmotesProviderApiInterface {
  public static readonly name = '7tv';

  protected readonly transport = new Transport({});

  public async getChannelEmotes(id: string): Promise<Record<string, EmoteEntity>> {
    const response = await this.transport.get<SevenTvChannelEmotesResponse>(`https://7tv.io/v3/users/twitch/${id}`);

    return response.emote_set.emotes.reduce<Record<string, EmoteEntity>>((result, rawEmote) => {
      /**
       * @todo Improve ofc
       */
      result[rawEmote.name] = {
        '1.0x': `https:${rawEmote.data.host.url}/${rawEmote.data.host.files.find((file) => file.name === '1x.avif')?.name}`,
        '2.0x': `https:${rawEmote.data.host.url}/${rawEmote.data.host.files.find((file) => file.name === '2x.avif')?.name}`,
        '3.0x': `https:${rawEmote.data.host.url}/${rawEmote.data.host.files.find((file) => file.name === '3x.avif')?.name}`,
        '4.0x': `https:${rawEmote.data.host.url}/${rawEmote.data.host.files.find((file) => file.name === '4x.avif')?.name}`,
      };

      return result;
    }, {});
  }
}
