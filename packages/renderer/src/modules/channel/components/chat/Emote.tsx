import { type FunctionalComponent } from 'vue';
import { type ChatEmote } from '../../types/chat';
import { getEmoteSrcSet } from '../../utils/emotes';

declare module '@vue/runtime-dom' {
  interface ImgHTMLAttributes extends HTMLAttributes {
    loading?: 'lazy' | 'eager' | 'auto';
  }
}

const Emote: FunctionalComponent<ChatEmote & { key: string }, {
  select: (props: ChatEmote) => void;
}> = (props, { emit }) => {
  return <div
    class="emote-preview"
    title={props.name}
    onClick={() => {
      emit('select', props);
    }}
  >
    <img
      srcset={getEmoteSrcSet(props.urls)}
      alt={props.name}
      loading="lazy"
    />
  </div>;
};

export default Emote;
