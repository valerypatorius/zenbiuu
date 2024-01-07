import AbstractProvider from '../AbstractProvider';
import { type FFZChannelEmotesResponse } from './types';
import type EmotesProviderApiInterface from '@/interfaces/EmotesProviderApi.interface';
import { type EmoteEntity } from '@/entities/EmoteEntity';

export default class FFZ extends AbstractProvider implements EmotesProviderApiInterface {
  public async getChannelEmotes (id: string): Promise<Record<string, EmoteEntity>> {
    const response = await this.transport.get<FFZChannelEmotesResponse>(`https://api.frankerfacez.com/v1/room/id/${id}`);

    return Object.values(response.sets).map((set) => set.emoticons).flat().reduce<Record<string, EmoteEntity>>((result, rawEmote) => {
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
