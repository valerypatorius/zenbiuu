<template>
  <div
    class="chat scrollable"
  >
    <div
      v-if="messages.length === 0"
      class="chat__welcome"
    >
      Joined {{ channelName }}
    </div>

    <template v-else>
      <ChatMessage
        v-for="message in messages"
        :key="message.id"
        v-bind="message"
      />

      <div
        ref="horizon"
        class="chat__horizon"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import ChatMessage from './ChatMessage';
import { useChat } from '@/presentation/vue/services/useChat';

const props = defineProps<{
  channelName: string;
}>();

const { join, leave, messagesByChannel } = useChat();

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
});

onBeforeUnmount(() => {
  leave(props.channelName);
});
</script>

<style lang="postcss">
.chat {
  padding: 12px 6px;
  display: grid;
  gap: 4px;
  align-content: start;

  &__welcome {
    text-align: center;
    padding: 12px;
  }
}
</style>
