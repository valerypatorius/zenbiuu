<template>
  <div class="settings-section">
    <div class="settings-section__title">
      Twitch
    </div>

    <div class="settings-action">
      <div class="settings-action__main">
        {{ userName }}<br>

        <a href="https://www.twitch.tv/settings/profile">
          {{ $t('settings.account.twitchSettings') }}
        </a>
      </div>

      <button
        v-if="userAccessToken"
        :disabled="isLoading"
        @click="logout"
      >
        {{ $t('settings.logout') }}
      </button>
    </div>
  </div>

  <div
    v-if="isDevelopment"
    class="settings-section"
  >
    <div class="settings-section__title">
      {{ $t('debug.title') }}
    </div>

    <div class="settings-action">
      <div class="settings-action__main">
        {{ userName }}
      </div>

      <button @click="openChannel(userName, userId)">
        {{ $t('debug.openChannel') }}
      </button>
    </div>

    <div class="settings-action">
      <div class="settings-action__main">
        zenbiuu
      </div>

      <button @click="openChannel('zenbiuu', '702891213')">
        {{ $t('debug.openChannel') }}
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { REVOKE_USER_ACCESS_TOKEN, TOGGLE_APP_SETTINGS, RESET_LIBRARY } from '@/src/store/actions';
import { RouteName } from '@/types/renderer/router';
import { isDevelopment } from '@/src/utils/utils';
import { clearSessionStorage } from '@/src/utils/hub';

export default defineComponent({
  name: 'SettingsAccount',
  data (): {
    isLoading: boolean;
    isDevelopment: boolean;
    } {
    return {
      /**
       * True, if logout request is being processed
       */
      isLoading: false,

      /**
       * True, if app is in development mode
       */
      isDevelopment: isDevelopment(),
    };
  },
  computed: {
    /**
     * Twitch client ID
     */
    clientId (): string | null {
      return this.$store.state.clientId;
    },

    /**
     * Logined user name
     */
    userName (): string | null {
      return this.$store.state.user.name;
    },

    /**
     * Logined user id
     */
    userId (): string | null {
      return this.$store.state.user.id;
    },

    /**
     * Logined user access token
     */
    userAccessToken (): string | null {
      return this.$store.state.user.token;
    },
  },
  methods: {
    /**
     * Log out current user and go to auth screen
     */
    async logout (): Promise<void> {
      if (this.isLoading) {
        return;
      }

      this.isLoading = true;

      await this.$store.dispatch(REVOKE_USER_ACCESS_TOKEN, {
        clientId: this.clientId,
        token: this.userAccessToken,
      });

      this.isLoading = false;

      this.$store.dispatch(TOGGLE_APP_SETTINGS);
      this.$store.dispatch(RESET_LIBRARY);
      this.$router.replace({ name: RouteName.Auth });

      clearSessionStorage();
    },

    /**
     * Open channel by its name and id.
     * Used for debug
     */
    openChannel (channelName: string | null, channelId: string | null): void {
      this.$store.dispatch(TOGGLE_APP_SETTINGS);

      this.$router.replace({
        name: RouteName.Channel,
        params: {
          name: channelName,
          id: channelId,
        },
      });
    },
  },
});
</script>
