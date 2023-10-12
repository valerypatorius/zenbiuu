import LibraryStore from './store';
import type ProvidersInterface from '@/interfaces/Providers.interface';
import type AccountEntity from '@/entities/AccountEntity';

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

  public async getFollowedChannels (account: AccountEntity): Promise<void> {
    const channels = await this.providers.getApi(account.provider).getFollowedChannelsByUserId(account.id);

    this.#store.setFollowedChannels(channels);
  }

  public async getFollowedLiveStreams (account: AccountEntity): Promise<void> {
    const streams = await this.providers.getApi(account.provider).getFollowedStreamsByUserId(account.id);

    this.#store.setLiveStreams(streams);
  }

  /**
   * @todo Improve saving
   */
  public async getUsersByIds (account: AccountEntity, ids: string[]): Promise<void> {
    const users = await this.providers.getApi(account.provider).getUsersByIds(ids);

    this.#store.setUsers(users);
  }

  public activateChannel (id: string): void {
    this.#store.addActiveChannelId(id);
  }

  public deactivateChannel (id: string): void {
    this.#store.removeActiveChannelId(id);
  }

  public deactivateAllChannels (): void {
    this.#store.clearActiveChannelIds();
  }

  public clear (): void {
    this.#store.clearAll();
  }
}
