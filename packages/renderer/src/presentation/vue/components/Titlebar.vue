<template>
  <div class="titlebar">
    <div
      :class="[
        'titlebar__actions',
        isSidebarActive && 'titlebar__actions--with-sidebar',
      ]"
    >
      <div
        class="titlebar__button"
        @click="emit('toggleSettings')"
      >
        <Icon
          name="settings"
          :size="20"
        />
      </div>

      <div
        class="titlebar__button"
        @click="emit('toggleLeftSidebar')"
      >
        <Icon
          :name="isSidebarActive ? 'sidebarLeftCollapse' : 'sidebarRightCollapse'"
          :size="20"
        />
      </div>
    </div>

    <div
      v-show="isStreamActive"
      class="titlebar__button"
      @click="emit('goHome')"
    >
      <Icon
        name="home"
        :size="20"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import Icon from '@/presentation/vue/components/ui/Icon.vue';

defineProps<{
  isStreamActive?: boolean;
  isSidebarActive?: boolean;
}>();

const emit = defineEmits<{
  toggleSettings: [];
  goHome: [];
  toggleLeftSidebar: [];
}>();
</script>

<style lang="postcss">
@import '@/presentation/styles/typography.pcss';

.titlebar {
  -webkit-app-region: drag;
  width: 100%;
  height: var(--layout-titlebar-height);
  display: flex;
  user-select: none;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 10;

  &__actions {
    display: flex;
    justify-content: space-between;

    &--with-sidebar {
      width: var(--layout-left-sidebar-width);
    }
  }

  &__button {
    -webkit-app-region: no-drag;
    display: flex;
    padding: 0 16px;
    align-items: center;
    color: var(--theme-color-text-secondary);

    &:hover {
      background-color: rgba(255, 255, 255, 0.05);
    }
  }
}
</style>
