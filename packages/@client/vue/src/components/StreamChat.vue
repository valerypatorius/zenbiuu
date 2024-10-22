<template>
  <div
    ref="container"
    :class="['chat', isEnableTopOffset && 'chat--with-top-offset']"
  >
    <Scrollable v-slot="{ isBottomReached }">
      <div class="chat__main">
        <div
          v-if="messages.length === 0 && channel !== undefined"
          class="chat__welcome"
        >
          <Icon
            name="message"
            :size="24"
          />

          {{
            t('chat.joinedAs', {
              channel: channel.name,
              name: primaryAccount?.name,
            })
          }}
        </div>

        <template v-else>
          <ChatMessage
            v-for="message in messages"
            :key="message.id"
            v-bind="message"
          />

          <div
            v-if="isContainerHovered && !isBottomReached"
            class="chat__footer"
          >
            <Button @click="scrollToBottom()">
              {{ t('chat.scrollToBottom') }}
            </Button>
          </div>

          <div
            ref="horizon"
            class="chat__horizon"
          />
        </template>
      </div>
    </Scrollable>
  </div>
</template>

<script setup lang="ts">
import type { ChannelEntity } from '@client/shared';
import { useElementHover } from '@vueuse/core';
import {
  computed,
  onBeforeUnmount,
  onMounted,
  ref,
  useTemplateRef,
  watch,
} from 'vue';
import { useI18n } from 'vue-i18n';
import { useChat } from '~/services/useChat';
import { useAccount } from '../services/useAccount';
import { useEmotes } from '../services/useEmotes';
import ChatMessage from './ChatMessage';
import Button from './ui/Button';
import Icon from './ui/Icon';
import Scrollable from './ui/Scrollable.vue';
import { useSettings } from '~/services/useSettings';

const props = defineProps<{
  channel?: ChannelEntity;
  isEnableTopOffset?: boolean;
}>();

const container = useTemplateRef('container');

const { join, leave, messagesByChannel } = useChat();
const { requestEmotes, emotesByChannelId } = useEmotes();
const { primaryAccount } = useAccount();
const { isSmoothScrollEnabled } = useSettings();
const { t } = useI18n();
const isContainerHovered = useElementHover(container);

const horizon = ref<HTMLDivElement>();

const messages = computed(() => {
  if (props.channel === undefined) {
    return [];
  }

  const list = messagesByChannel.get(props.channel.name);

  if (list === undefined) {
    return [];
  }

  /**
   * @todo Improve
   */
  return list.map((message) => {
    return {
      ...message,
      emotes: {
        ...emotesByChannelId.get(props.channel?.id ?? ''),
        ...message.emotes,
      },
    };
  });
});

const lastMessage = computed(() => messages.value[messages.value.length - 1]);

function scrollToBottom(): void {
  horizon.value?.scrollIntoView({
    block: 'end',
    behavior: isSmoothScrollEnabled.value ? 'smooth' : 'auto',
  });
}

watch(
  lastMessage,
  () => {
    requestAnimationFrame(() => {
      if (!isContainerHovered.value) {
        scrollToBottom();
      }
    });
  },
  {
    flush: 'post',
  },
);

onMounted(() => {
  if (props.channel === undefined) {
    return;
  }

  requestEmotes(props.channel.id);
  join(props.channel);
});

onBeforeUnmount(() => {
  if (props.channel === undefined) {
    return;
  }

  leave(props.channel);
});
</script>

<style lang="postcss">
.chat {
  display: grid;

  &--with-top-offset {
    padding-top: var(--layout-titlebar-height);
  }

  &__welcome {
    margin: 0 auto;
    min-height: 100%;
    display: flex;
    gap: 8px;
    text-align: center;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 24px;
    color: var(--theme-color-text-secondary);
    position: absolute;

    .icon {
      opacity: 0.5;
    }
  }

  &__horizon {
    height: 6px;
  }

  &__footer {
    width: 100%;
    position: sticky;
    bottom: 0;
    left: 0;
    padding: 20px;
    display: flex;
    justify-content: center;
  }
}
</style>
