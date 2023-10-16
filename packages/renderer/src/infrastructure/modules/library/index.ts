import LibraryStore from './store';
import type ProvidersInterface from '@/interfaces/Providers.interface';
import type AccountEntity from '@/entities/AccountEntity';
import type LiveStream from '@/entities/LiveStream';

export default class Library {
  #store: LibraryStore;

  private constructor (
    store: LibraryStore,
    private readonly providers: ProvidersInterface,
  ) {
    this.#store = store;
  }

  static async build (providers: ProvidersInterface): Promise<Library> {
    const store = await LibraryStore.build();

    return new Library(store, providers);
  }

  public get store (): LibraryStore {
    return this.#store;
  }

  public async requestFollowedChannelsNames (account: AccountEntity): Promise<void> {
    const ids = await this.providers.getApi(account.provider).getFollowedChannelsNamesByUserId(account.id);

    this.#store.followedChannelsNames.set(ids);
  }

  public async requestFollowedLiveStreams (account: AccountEntity): Promise<void> {
    const streams = await this.providers.getApi(account.provider).getFollowedStreamsByUserId(account.id);

    const streamsByChannelName = streams.reduce<Record<string, LiveStream>>((result, item) => {
      result[item.channelName] = item;

      return result;
    }, {});

    this.#store.liveStreamsByChannelName.set(streamsByChannelName);
  }

  private readonly namesBuffer = new Set<string>();

  private namesTimeoutId: ReturnType<typeof setTimeout> | undefined;

  public async requestChannelByName (account: AccountEntity, name: string): Promise<void> {
    if (name in this.#store.channelsByName.state || this.namesBuffer.has(name)) {
      return;
    }

    this.namesBuffer.add(name);

    clearTimeout(this.namesTimeoutId);

    this.namesTimeoutId = setTimeout(() => {
      this.providers.getApi(account.provider).getChannelsByNames(Array.from(this.namesBuffer)).then((channels) => {
        channels.forEach((channel) => {
          this.#store.channelsByName.add(channel.name, channel);
        });
      });

      this.namesBuffer.clear();
    }, 300);
  }

  public activateChannel (name: string): void {
    this.#store.activeChannelsNames.add(name);
  }

  public deactivateChannel (name: string): void {
    this.#store.activeChannelsNames.remove(name);
  }

  public deactivateAllChannels (): void {
    this.#store.activeChannelsNames.clear();
  }

  public async getChannelPlaylistUrl (account: AccountEntity, name: string): Promise<string | undefined> {
    return this.providers.getApi(account.provider).getChannelPlaylistUrl(name);
  }

  public destroy (): void {
    this.#store.clear();
  }
}
