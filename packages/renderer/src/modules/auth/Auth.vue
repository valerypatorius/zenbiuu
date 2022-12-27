<template>
  <div class="auth scrollable">
    <img
      class="auth__icon"
      :src="appIconPath"
      alt=""
    >

    <div class="auth__content">
      <div class="auth__title">
        {{ t('auth.title') }} {{ hubState.appName }}
      </div>

      <div class="auth__description">
        <p>{{ t('auth.description') }}</p>
        <p>{{ t('auth.disclaimer') }}</p>
      </div>

      <div class="auth__buttons">
        <button
          :disabled="isLoading"
          @click="requestAuth"
        >
          <icon name="Twitch" />
          {{ t('auth.loginWithTwitch') }}
        </button>
      </div>
    </div>

    <div
      class="auth-settings"
      @click="toggleSettings"
    >
      <div class="auth-settings__icon">
        <icon name="Settings" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import Icon from '@/src/modules/ui/components/Icon.vue';
import appIconPath from '@/assets/icon.svg';
import { useRouter } from 'vue-router';
import { useInterface } from '@/src/infrastructure/interface/useInterface';
import { useAuth } from '@/src/store/useAuth';
import { RouteName } from '@/types/renderer/router';
import { useHub } from '@/src/store/useHub';

const router = useRouter();
const { t } = useI18n();
const { isSettingsActive } = useInterface();
const { authorize } = useAuth();
const { state: hubState } = useHub();

/**
 * True, if auth is being processed.
 * Prevents multiple buttons clicks
 */
const isLoading = ref(false);

/** Toggle settings panel */
function toggleSettings () {
  isSettingsActive.value = !isSettingsActive.value;
}

/** Request auth and go to library screen */
async function requestAuth (): Promise<void> {
  if (isLoading.value) {
    return;
  }

  isLoading.value = true;

  try {
    await authorize();

    router.replace({ name: RouteName.Library });
  } finally {
    isLoading.value = false;
  }
}
</script>

<style>
  .auth {
    --width-image: 28rem;

    display: grid;
    grid-template-columns: auto auto;
    align-items: center;
    justify-content: center;
    margin: auto 0;
    max-height: 100%;
  }

  @media (max-width: 640px) {
    .auth {
      grid-template-columns: auto;
    }
  }

  .auth__content {
    padding: var(--offset-window);
  }

  .auth__icon {
    display: block;
    width: var(--width-image);
  }

  .auth__title {
    font-size: 3rem;
    line-height: 1em;
    font-weight: 500;
    margin-bottom: 4rem;
  }

  .auth__description {
    font-size: 1.6rem;
    line-height: 1.6em;
    max-width: 35rem;
    margin-bottom: 4rem;
  }

  .auth__buttons {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }

  .auth__buttons button:not(:last-child) {
    margin-bottom: 1.6rem;
  }

  .auth__buttons button .icon {
    margin-top: 0.2rem;
  }

  .auth-settings {
    height: 4rem;
    border-radius: var(--border-radius);
    display: flex;
    align-items: center;
    position: fixed;
    bottom: 1rem;
    left: 1rem;
    color: var(--color-text);
    padding: 0 1rem;
    cursor: pointer;
    color: var(--color-text-secondary);
  }

  .auth-settings:hover {
    background-color: var(--color-control-active);
  }

  .auth-settings .icon {
    width: 2rem;
  }
</style>
