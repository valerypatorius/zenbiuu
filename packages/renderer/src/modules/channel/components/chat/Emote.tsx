import { type FunctionalComponent } from 'vue';
import { type EmoteProvider } from '../../types/chat';
import { getEmoteSrcSet } from '../../utils/emotes';

interface EmoteProps {
  urls: Record<`${string | number}x`, string>;
  provider: EmoteProvider;
  name: string;
}

const Emote: FunctionalComponent<EmoteProps, {
  click: (emoteName: string) => void;
}> = (props, { emit }) => {
  return <div
    class="emote-preview"
    title={props.name}
    onClick={() => {
      emit('click', props.name);
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
