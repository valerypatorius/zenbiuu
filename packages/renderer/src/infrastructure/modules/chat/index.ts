import ChatStore from './store';
import type ProvidersInterface from '@/interfaces/Providers.interface';
import type AccountEntity from '@/entities/AccountEntity';

export default class Chat {
  #store: ChatStore;

  private constructor (
    store: ChatStore,
    private readonly providers: ProvidersInterface,
  ) {
    this.#store = store;
  }

  static async build (providers: ProvidersInterface): Promise<Chat> {
    const store = await ChatStore.build();

    return new Chat(store, providers);
  }

  public get store (): ChatStore {
    return this.#store;
  }

  public join (account: AccountEntity, channelName: string): void {
    this.providers.getApi(account.provider).joinChat(channelName, (message) => {
      this.#store.addChatMessage(channelName, message);
    });
  }

  public leave (account: AccountEntity, channelName: string): void {
    this.providers.getApi(account.provider).leaveChat(channelName);

    this.#store.clearChannelMessages(channelName);
  }

  public destroy (): void {
    this.#store.clear();
  }
}
