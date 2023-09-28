<template>
  <TransitionGroup
    class="errors"
    tag="div"
    name="list"
  >
    <div
      v-for="(item, i) in errors"
      :key="item.date.getTime()"
      class="error"
      :style="{
        'top': `${i * 8}px`,
      }"
    >
      <span class="error__time">{{ item.date.toLocaleTimeString() }}</span>
      {{ t(`errors.${item.error.message}`) }}

      <div
        class="error__close"
        @click="remove(item)"
      >
        <Icon name="Close" />
      </div>
    </div>
  </TransitionGroup>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import Icon from './ui/Icon.vue';
import { useErrors } from '@/presentation/vue/services/useErrors';

const { errors, remove } = useErrors();
const { t } = useI18n();
</script>

<style lang="postcss">
@import '@/presentation/styles/typography.pcss';
@import '@/presentation/styles/squircle.pcss';

.errors {
  position: absolute;
  top: 0;
  left: 0;
  padding: 12px;
  display: grid;
  /* flex-direction: column-reverse; */
  /* gap: 8px; */
}

.error {
  @extend %text-small;
  font-weight: 500;
  width: 400px;
  padding: 16px 20px;
  padding-right: 50px;
  /* border: 2px solid #d91e18; */
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 0 8px -4px rgba(0, 0, 0, 0.1), 0 2px 20px -5px rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 1;
  grid-row: 1;
  grid-column: 1;

  &__time {
    font-weight: 400;
    color: var(--theme-color-text-secondary);
    margin-right: 4px;
  }

  &__close {
    position: absolute;
    top: 12px;
    right: 12px;
    cursor: pointer;
    color: rgba(0, 0, 0, 0.15);
  }
}

.list-enter-active {
  transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.list-move,
.list-leave-active {
  transition: all 0.14s ease-in;
}

.list-enter-from {
  opacity: 0;
  transform: translate(0, -10px);
}

.list-leave-to {
  opacity: 0;
  transform: translate(0, -10px);
}
</style>
