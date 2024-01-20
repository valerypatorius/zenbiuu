import { type FunctionalComponent } from 'vue';
import type ChatMessage from '@/entities/ChatMessage';
import './styles/chat.pcss';
import { type EmoteEntity } from '@/entities/EmoteEntity';

/**
 * Returns emote urls string to use as srcset value
 */
function getEmoteSrcSet (emote: EmoteEntity): string {
  return Object.entries(emote).reduce<string[]>((result, [size, url]) => {
    result.push(`${url as string} ${size}`);
    return result;
  }, []).join(',');
}

/**
 * Returns image node of an emote
 */
function getEmoteImage (name: string, emote: EmoteEntity): HTMLImageElement {
  const img = new Image();

  img.alt = name;
  img.loading = 'lazy';
  img.srcset = getEmoteSrcSet(emote);
  img.title = name;

  return img;
}

const Message: FunctionalComponent<ChatMessage> = ({
  author,
  text,
  color,
  emotes,
  isEven,
  isModerator,
  isSubscriber,
  isStreamer,
}) => {
  const emotifiedText = emotes !== undefined
    ? text.split(' ').map((word) => {
      /**
       * @todo Set size from 1x image to reserve space
       */
      return word in emotes ? getEmoteImage(word, emotes[word]).outerHTML : word;
    }).join(' ')
    : text;

  const badges = [];

  if (isStreamer === true) {
    badges.push('streamer');
  }

  if (isModerator === true) {
    badges.push('moderator');
  }

  if (isSubscriber === true) {
    badges.push('subscriber');
  }

  return <div
    class={[
      'chat-message',
      isEven === true && 'chat-message--with-background',
    ]}
    style={{
      '--color': color,
    }}
  >
    {
      badges.length > 0 &&
      <span class="chat-message-badges">
        {badges.map((name) => <span class={`chat-message-badge chat-message-badge--${name}`}></span>)}
      </span>
    }

    <span class="chat-message__author">
      {author}
    </span>

    <span v-html={emotifiedText} />
  </div>;
};

export default Message;
