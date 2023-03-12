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

/**
 * Available player layouts
 */
export enum PlayerLayout {
  Horizontal = 'horizontal',
  Vertical = 'vertical',
}

/**
 * Player DOM-elements which properties can be modified
 */
export interface PlayerElements {
  player: HTMLElement;
  video: HTMLVideoElement;
  canvas: HTMLCanvasElement;
}

/**
 * Twitch response for playlist access token request
 */
export interface AccessTokenResponse {
  data: {
    streamPlaybackAccessToken: {
      signature: string;
      value: string;
    };
  };
  extensions: {
    durationMilliseconds: number;
    operationName: string;
    requestID: string;
  };
}
