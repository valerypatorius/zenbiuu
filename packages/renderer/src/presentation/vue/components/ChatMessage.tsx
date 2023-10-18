import { type FunctionalComponent } from 'vue';
import type ChatMessage from '@/entities/ChatMessage';
import './styles/chat.pcss';

const Message: FunctionalComponent<ChatMessage> = ({
  author,
  text,
  color,
}) => {
  return <div
    class="chat-message"
    style={{
      '--color': color,
    }}
  >
    <span class="chat-message__author">
      {author}
    </span>

    {text}
  </div>;
};

export default Message;
