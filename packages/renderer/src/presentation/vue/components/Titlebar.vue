<template>
  <div class="titlebar">
    <div class="titlebar__actions">
      <div
        class="titlebar__button"
        @click="toggleSettingsState"
      >
        <Icon name="settings" />
      </div>

      <!-- <div
        class="titlebar__button"
        @click="getUserData(Provider.Twitch)"
      >
        <template v-if="isAuthorized">
          <Icon name="userAuthorized" />
        </template>

        <template v-else>
          <Icon name="userUnknown" />
        </template>
      </div> -->
    </div>

    {{ app.name }}
  </div>
</template>

<script setup lang="ts">
// import { Provider } from '../../auth/types';
// import { useAuth } from '../../auth/useAuth';
// import { useUser } from '../../auth/useUser';
import { useSettings } from '../services/useSettings';
import Icon from '@/presentation/vue/components/ui/Icon.vue';
import { useHub } from '@/presentation/vue/services/useHub';

const { app } = useHub();
const { toggleState: toggleSettingsState } = useSettings();
// const { isAuthorized } = useAuth();
// const { getUserData } = useUser();
</script>

<style lang="postcss">
@import '@/presentation/styles/typography.pcss';

.titlebar {
  @extend %text-small;
  -webkit-app-region: drag;
  height: var(--layout-titlebar-height);
  display: flex;
  align-items: center;
  justify-content: center;
  user-select: none;
  position: relative;
  color: var(--theme-color-text-secondary);

  &__actions {
    height: 100%;
    position: absolute;
    left: 0;
    display: flex;
    color: var(--theme-color-text);
    -webkit-app-region: no-drag;
    z-index: 2;
  }

  &__button {
    display: flex;
    padding: 0 10px;
    align-items: center;

    &:hover {
      /* color: var(--theme-color-button-background); */
      background-color: var(--theme-color-text-tertiary);
    }

    .icon {
      width: 20px;
    }
  }
}
</style>
