import 'vue-router';

/**
 * Available app routes
 */
export enum RouteName {
  Auth = 'Auth',
  Library = 'Library',
  Channel = 'Channel',
}

declare module 'vue-router' {
  interface RouteMeta {
    title?: () => string;
  }
}
