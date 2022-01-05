<template>
  <div class="chat-form">
    <!-- <div
      :class="[
        'chat-form__control',
        {
          'chat-form__control--active': isEmotesListVisible,
        },
      ]"
      @click="toggleEmotesList"
    >
      <icon name="Emote" />
    </div> -->

    <textarea
      ref="field"
      v-model.trim="message"
      rows="1"
      class="chat-form__field"
      :placeholder="$t('chat.form.placeholder')"
      @input="onInput"
      @keyup.ctrl.enter="submit"
    />

    <div
      v-show="!isMessageEmpty"
      class="chat-form__control"
      @click="submit"
    >
      <icon name="ArrowUp" />
    </div>

    <!-- <chat-emotes
      v-show="isEmotesListVisible"
      @select="onEmoteSelect"
    /> -->
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import Icon from '@/src/components/ui/Icon.vue';
import ChatEmotes from '@/src/components/chat/Emotes.vue';
import irc from '@/src/utils/irc';
import { getUniqueToken } from '@/src/utils/hub';
import { ADD_CHAT_MESSAGE } from '@/src/store/actions';

/**
 * Message characters limit
 */
const CHARS_LIMIT = 500;

export default defineComponent({
  name: 'ChatForm',
  components: {
    Icon,
    ChatEmotes,
  },
  props: {
    /**
     * Channel name
     */
    channelName: {
      type: String,
      default: '',
    },
  },
  data (): {
    message: string;
    isEmotesListVisible: boolean;
    } {
    return {
      message: '',
      isEmotesListVisible: false,
    };
  },
  computed: {
    userName (): string | null {
      return this.$store.state.user.name;
    },

    isMessageEmpty (): boolean {
      return this.message.length === 0;
    },

    userState () {
      return this.$store.state.chat.userState;
    },
  },
  methods: {
    updateFieldHeight () {
      const field = (this.$refs.field as HTMLInputElement);

      window.requestAnimationFrame(() => {
        field.style.height = 'auto';
        field.style.height = field.scrollHeight + 'px';
      });
    },

    onInput (): void {
      this.message = this.message.trim().slice(0, CHARS_LIMIT);

      this.updateFieldHeight();
    },

    onEmoteSelect (emoteName: string) {
      const emotePosition = (this.$refs.field as HTMLInputElement).selectionStart ?? this.message.length - 1;

      this.message = `${this.message.substring(0, emotePosition)} ${emoteName} ${this.message.substring(emotePosition)}`;
      this.purifyMessage();

      this.updateFieldHeight();
    },

    toggleEmotesList (): void {
      this.isEmotesListVisible = !this.isEmotesListVisible;
    },

    purifyMessage () {
      this.message = this.message.replace(/\s+/g, ' ').trim();
    },

    async submit (): Promise<void> {
      console.log('Submit', this.message);

      const nonce = await getUniqueToken();

      irc.post('message', {
        channel: this.channelName,
        text: this.message,
        nonce: nonce.substring(0, 32),
      });

      this.$store.dispatch(ADD_CHAT_MESSAGE, {
        id: nonce,
        author: this.userName,
        color: this.userState.color,
        text: {
          value: this.message,
          isColored: false,
        },
        badges: this.userState.badges,
      });

      this.message = '';
      (this.$refs.field as HTMLInputElement).value = '';
    },
  },
});
</script>

<style>
  .chat-form {
    --height-initial: 4rem;

    position: relative;
    display: grid;
    grid-template-columns: 1fr auto;
    background-color: var(--color-overlay-full);
    border-radius: var(--border-radius);
  }

  .chat-form__field {
    flex: 1;
    min-height: var(--height-initial);
    background-color: transparent;
    padding: 1rem var(--item-offset-x);
    overflow-wrap: break-word;
    resize: none;
    overflow: hidden;
  }

  .chat-form__field::placeholder {
    color: var(--color-text-secondary);
  }

  .chat-form__field:focus::placeholder {
    color: var(--color-transparent);
  }

  .chat-form__control {
    display: flex;
    align-items: flex-end;
    padding: var(--item-offset-x);
    color: var(--color-text-secondary);
    cursor: pointer;
  }

  .chat-form__control:hover,
  .chat-form__control--active {
    color: var(--color-text);
  }

  .chat-form__control .icon {
    width: 2rem;
  }

  /* .chat-form__control {
    display: flex;
    align-items: flex-end;
    padding: var(--item-offset-x);
    cursor: pointer;
    color: var(--color-text-secondary);
    pointer-events: auto;
  }

  .chat-form__control:hover,
  .chat-form__control--active {
    color: var(--color-text);
  }

  .chat-form__control .icon {
    width: 2rem;
  }

  .chat-form__control:last-child {
    margin-left: auto;
  } */

  /* .chat-form .chat-emotes {
    position: absolute;
    bottom: 100%;
    left: 0;
    width: 100%;
    margin-bottom: 1rem;
  } */
</style>
