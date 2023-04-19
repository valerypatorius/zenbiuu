<template>
  <div class="auth scrollable">
    <img
      class="auth__icon"
      :src="appIconPath"
      alt=""
    >

    <div class="auth__content">
      <div class="auth__title">
        {{ t('auth.title') }} {{ hubState.app.name }}
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
import { ref, onBeforeUnmount } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { useAuth, UserError } from './useAuth';
import Icon from '@/src/modules/ui/components/Icon.vue';
import appIconPath from '@/assets/icon.svg';
import { useInterface } from '@/src/infrastructure/interface/useInterface';
import { RouteName } from '@/src/infrastructure/router/types';
import { useHub } from '@/src/infrastructure/hub/useHub';

const router = useRouter();
const { t } = useI18n();
const { isSettingsActive } = useInterface();
const { requestAuth, setToken, validate } = useAuth();
const { state: hubState, onInterceptedEvent } = useHub();

const isLoading = ref(false);

/** Toggle settings panel */
function toggleSettings () {
  isSettingsActive.value = !isSettingsActive.value;
}

/**
 * While auth screen is active, listen for intercepted links to catch the one,
 * which provides auth token from browser
 */
const { off: offInterceptedEvent } = onInterceptedEvent(({ method, payload }) => {
  if (method !== 'auth') {
    return;
  }

  /**
   * @todo Improve typings
   */
  const token = payload.token;

  if (typeof token !== 'string') {
    console.error(UserError.FailedAuth);
    return;
  }

  isLoading.value = true;

  /**
   * Save received token
   */
  setToken(token);

  /**
   * Validate it and show library screen
   */
  validate().then(() => {
    router.replace({ name: RouteName.Library });
  });
});

onBeforeUnmount(() => {
  offInterceptedEvent();
});
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
