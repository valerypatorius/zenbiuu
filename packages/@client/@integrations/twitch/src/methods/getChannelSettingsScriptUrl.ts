export function getChannelSettingsScriptUrl(html: string): string {
  const channelSettingsUrl = html.match(/https:\/\/static.twitchcdn.net\/config\/settings.*?js/)?.[0];

  if (channelSettingsUrl === undefined) {
    throw new Error('Failed to locate channel settings script');
  }

  return channelSettingsUrl;
}
