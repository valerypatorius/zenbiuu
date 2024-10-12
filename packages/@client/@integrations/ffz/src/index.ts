import {
  AbstractEmotesProvider,
  type EmoteEntity,
  type EmotesProviderApiInterface,
} from '@client/shared';
import { Transport } from '@client/transport';
import type { FFZChannelEmotesResponse } from './types';

export default class FFZ
  extends AbstractEmotesProvider
  implements EmotesProviderApiInterface
{
  public static readonly name = 'ffz';

  protected readonly transport = new Transport({});

  public async getChannelEmotes(
    id: string,
  ): Promise<Record<string, EmoteEntity>> {
    const response = await this.transport.get<FFZChannelEmotesResponse>(
      `https://api.frankerfacez.com/v1/room/id/${id}`,
    );

    return Object.values(response.sets)
      .flatMap((set) => set.emoticons)
      .reduce<Record<string, EmoteEntity>>((result, rawEmote) => {
        /**
         * @todo Improve ofc
         */
        result[rawEmote.name] = {
          '1.0x': rawEmote.urls[1],
          '2.0x': rawEmote.urls[2],
          '4.0x': rawEmote.urls[4],
        };

        return result;
      }, {});
  }
}
