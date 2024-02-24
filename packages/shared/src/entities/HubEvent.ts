export enum HubEvent {
  /**
   * Dispatched when app intercepts links with app protocol from the outside.
   * E.g. when "zenbiuu://open" is opened in browser
   */
  InterceptedLink = 'hubInterceptedLink',
}
