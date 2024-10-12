import SevenTv from '@integrations/7tv';
import BTTV from '@integrations/bttv';
import FFZ from '@integrations/ffz';
import Twitch from '@integrations/twitch';

export const PlatformProvider = {
  [Twitch.config.name]: Twitch,
} as const;

export const EmotesProvider = {
  [SevenTv.name]: SevenTv,
  [BTTV.name]: BTTV,
  [FFZ.name]: FFZ,
} as const;
