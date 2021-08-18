<template>
  <div class="auth scrollable">
    <img
      class="auth__icon"
      :src="appIconPath"
      alt=""
    >

    <div class="auth__content">
      <div class="auth__title">
        {{ $t('auth.title') }} {{ title }}
      </div>

      <div class="auth__description">
        <p>{{ $t('auth.description') }}</p>
        <p>{{ $t('auth.disclaimer') }}</p>
      </div>

      <div class="auth__buttons">
        <button
          :disabled="isLoading"
          @click="requestAuth"
        >
          <icon name="Twitch" />
          {{ $t('auth.loginWithTwitch') }}
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

<script lang="ts">
import { defineComponent } from 'vue';
import Icon from '@/src/components/ui/Icon.vue';
import { getAppName } from '@/src/utils/utils';
import {
  REQUEST_USER_ACCESS_TOKEN,
  GET_USER_FOLLOWS,
  GET_STREAMS,
  GET_USERS,
  TOGGLE_APP_SETTINGS,
} from '@/src/store/actions';
import appIconPath from '@/assets/icon.svg';

export default defineComponent({
  name: 'Auth',
  components: {
    Icon,
  },
  emits: ['success'],
  data (): {
    title: string;
    appIconPath: string;
    isLoading: boolean;
    } {
    return {
      /**
       * Screen title
       */
      title: getAppName(),

      /**
       * Path to app icon
       */
      appIconPath,

      /**
       * True, if auth is being processed.
       * Prevents multiple buttons clicks
       */
      isLoading: false,
    };
  },
  computed: {
    /**
     * App client id
     */
    clientId (): string | null {
      return this.$store.state.clientId;
    },

    /**
     * Url to redirect after auth
     */
    redirectUrl (): string | null {
      return this.$store.state.redirectUrl;
    },
  },
  methods: {
    /**
     * Toggle settings panel
     */
    toggleSettings () {
      this.$store.dispatch(TOGGLE_APP_SETTINGS);
    },

    /**
     * Request auth
     */
    async requestAuth (): Promise<void> {
      if (this.isLoading) {
        return;
      }

      this.isLoading = true;

      const isAuthSuccess = await this.$store.dispatch(REQUEST_USER_ACCESS_TOKEN, {
        clientId: this.clientId,
        redirectUrl: this.redirectUrl,
      });

      this.isLoading = false;

      if (!isAuthSuccess) {
        return;
      }

      this.$store.dispatch(GET_USER_FOLLOWS);
      this.$store.dispatch(GET_USERS);
      this.$store.dispatch(GET_STREAMS);

      this.$router.replace({ name: 'Library' });
    },
  },
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
