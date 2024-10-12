export default {
  library: 'Library',
  router: {
    auth: 'Log in',
    library: 'Library',
  },
  auth: {
    title: 'Log in to',
    description:
      'To start watching streams in comfort simply connect your Twitch account.',
    disclaimer:
      'Authorization is needed in order to communicate with Twitch API. No personal data is stored.',
    loginWithTwitch: 'Log in with Twitch account',
  },
  sidebar: {
    settings: 'Settings',
    hide: 'Hide',
    foundItems: 'Search results',
    showOffline: 'Show offline',
    hideOffline: 'Hide offline',
    searchError: 'Nothing found',
  },
  settings: {
    title: 'Settings',
    interface: {
      title: 'Interface',
      general: 'General',
      isAlwaysOnTop: 'App window always on top',
      isBlurEnabled: 'Enable blur effects',
      size: 'Interface size',
    },
    colorScheme: {
      title: 'Color scheme',
      system: 'System',
      dark: 'Dark',
      light: 'Light',
    },
    locale: {
      title: 'Language',
      change: 'Change the language',
    },
    account: {
      title: 'Account',
      twitchSettings: 'Open settings in browser',
    },
    about: {
      title: 'About',
      issue: 'Report an issue on',
      iconBy: 'App icon by',
      interfaceIcons: 'Interface icons by',
      updateChecking: 'Checking for updates',
      updateNotNeeded: 'Latest version is installed',
      updateAvailable: 'Update is available',
      updateDownload: 'Download',
      updateDownloading: 'Downloading',
      updateInstall: 'Install',
      updateProblems: 'Having problems?',
      updateManualDownload: 'Download manually',
    },
    logout: 'Logout',
  },
  chat: {
    connectingTo: 'Connecting to {channel} chat room...',
    joinedAs: "Joined {channel}'s chat room as {name}",
    scrollToBottom: 'Scroll to bottom',
    message: 'Message',
    emotes: {
      hot: 'Hot',
      recent: 'Recent',
      all: 'All',
    },
  },
  player: {
    mute: 'Mute',
    unmute: 'Unmute',
    compressor: 'compressor',
    source: 'Source',
    auto: 'Auto',
    startedAt: 'Started at',
    selectQuality: 'Select quality',
    showSidebar: 'Show sidebar',
    hideSidebar: 'Hide sidebar',
    showChat: 'Show chat',
    hideChat: 'Hide chat',
    enterFullscreen: 'Enter fullscreen',
    exitFullscreen: 'Exit fullscreen',
    setHorizontalLayout: 'Chat to the right',
    setVerticalLayout: 'Chat to the bottom',
    ad: 'Ad is playing',
  },
  sorting: {
    label: 'Sort by',
    viewers: 'viewers',
    channel: 'channel',
    game: 'game',
    duration: 'duration',
  },
  version: 'Version',
  legal: {
    disclaimer:
      '{name} is not affiliated with, authorized, maintained, sponsored or endorsed by Twitch Interactive, Inc. or any of its affiliates or subsidiaries.',
  },
  enable: 'Enable',
  disable: 'Disable',
  openInBrowser: 'Open in browser',
  search: 'Search',
  validUntilDate: 'Valid until {date}',
};
