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
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { REVOKE_USER_ACCESS_TOKEN, TOGGLE_APP_SETTINGS } from '@/src/store/actions';
import { RouteName } from '@/types/renderer/router';

export default defineComponent({
  name: 'SettingsAccount',
  data (): {
    isLoading: boolean;
    } {
    return {
      /**
       * True, if logout request is being processed
       */
      isLoading: false,
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
      this.$router.replace({ name: RouteName.Auth });
    },
  },
});
</script>
