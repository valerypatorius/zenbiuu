import type ChatMessage from '@/entities/ChatMessage';
import ObservableStore from '@/modules/shared/ObservableStore';
import { deleteObjectProperty, statefulObject } from '@/utils/object';

interface Schema {
  messagesByChannelName: Record<string, ChatMessage[]>;
}

export default class ChatStore extends ObservableStore<Schema> {
  #limit = 100;

  static async build (): Promise<ChatStore> {
    /**
     * @todo Do not put chat messages in IDB
     */
    const { name, data } = await ChatStore.prepare<Schema>('store:chat', {
      messagesByChannelName: {},
    });

    return new ChatStore(name, data);
  }

  public readonly messagesByChannelName = statefulObject(this.stateProxy.messagesByChannelName);

  public addChatMessage (channelName: string, message: ChatMessage): void {
    const messages = this.messagesByChannelName.state[channelName];

    if (messages === undefined) {
      this.messagesByChannelName.state[channelName] = [];
    }

    if (messages !== undefined && messages.length >= this.#limit) {
      this.messagesByChannelName.state[channelName].shift();
    }

    this.messagesByChannelName.state[channelName].push(message);
  }

  public clearChannelMessages (channelName: string): void {
    deleteObjectProperty(this.messagesByChannelName.state, channelName);
  }

  public clear (): void {
    this.messagesByChannelName.clear();
  }
}
