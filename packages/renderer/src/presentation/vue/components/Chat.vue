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
      <div
        v-for="message in messages"
        :key="message"
        class="chat__message"
      >
        {{ message }}
      </div>

      <div
        ref="horizon"
        class="chat__horizon"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useChat } from '@/presentation/vue/services/useChat';

const props = defineProps<{
  channelName: string;
}>();

const { join, leave, messagesByChannel } = useChat();

const horizon = ref<HTMLDivElement>();

const messages = computed(() => messagesByChannel.value[props.channelName] ?? []);

watch(() => messages.value.length, () => {
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
  &__welcome {
    text-align: center;
    padding: 12px;
  }

  &__message {
    padding: 6px 12px;
    color: var(--theme-color-text-secondary);

    &:nth-child(2n) {
      background-color: rgba(0, 0, 0, 0.15);
    }
  }
}
</style>
