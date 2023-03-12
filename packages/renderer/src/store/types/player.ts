import { PlayerLayout } from '@/src/modules/channel/types/player';

export interface PlayerStoreSchema {
  /** Volume level from 0 to 1 */
  volume: number;

  /** True, if compressor should be enabled */
  compressor: boolean;

  /** True, if sidebar should be hidden */
  isHideSidebar: boolean;

  /** True, if chat should be hidden */
  isHideChat: boolean;

  /** Player layout */
  layout: PlayerLayout;

  /** Player cover, used while video is loading */
  cover?: string;
}

export const PlayerStoreName = 'player';

export const defaultPlayerState: PlayerStoreSchema = {
  volume: 0.25,
  compressor: false,
  isHideSidebar: false,
  isHideChat: false,
  layout: PlayerLayout.Horizontal,
  cover: undefined,
};
