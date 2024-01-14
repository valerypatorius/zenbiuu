<template>
  <div
    :class="[
      'chat',
      isEnableTopOffset && 'chat--with-top-offset',
    ]"
  >
    <Scrollable>
      <div class="chat__main">
        <div
          v-if="messages.length === 0"
          class="chat__welcome"
        >
          <Icon
            name="message"
            :size="24"
          />

          {{ t('chat.joinedAs', {
            channel: channelName,
            name: primaryAccount?.name,
          }) }}
        </div>

        <template v-else>
          <ChatMessage
            v-for="message in messages"
            :key="message.id"
            v-bind="message"
            :emotes="emotesByChannelId[channelId]"
          />

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
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAccount } from '../services/useAccount';
import ChatMessage from './ChatMessage';
import Scrollable from './ui/Scrollable.vue';
import Icon from './ui/Icon';
import { useChat } from '@/presentation/vue/services/useChat';
import { useEmotes } from '@/presentation/vue/services/useEmotes';

const props = defineProps<{
  channelName: string;
  channelId: string;
  isEnableTopOffset?: boolean;
}>();

const { join, leave, messagesByChannel } = useChat();
const { requestEmotes, emotesByChannelId } = useEmotes();
const { primaryAccount } = useAccount();
const { t } = useI18n();

const horizon = ref<HTMLDivElement>();

const messages = computed(() => messagesByChannel.value[props.channelName] ?? []);

const lastMessage = computed(() => messages.value[messages.value.length - 1]);

watch(lastMessage, () => {
  requestAnimationFrame(() => {
    horizon.value?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  });
}, {
  flush: 'post',
});

onMounted(() => {
  join(props.channelName);
  requestEmotes(props.channelId);
});

onBeforeUnmount(() => {
  leave(props.channelName);
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
}
</style>
