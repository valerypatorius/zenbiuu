<template>
  <div class="settings-section">
    <div class="settings-section__title">
      Twitch
    </div>

    <div class="settings-action">
      <div class="settings-action__main">
        {{ userName }}<br>

        <a href="https://www.twitch.tv/settings/profile">
          {{ t('settings.account.twitchSettings') }}
        </a>
      </div>

      <button
        v-if="userAccessToken"
        :disabled="isLoading"
        @click="logout"
      >
        {{ t('settings.logout') }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useStore } from 'vuex';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { REVOKE_USER_ACCESS_TOKEN, TOGGLE_APP_SETTINGS, RESET_LIBRARY } from '@/src/store/actions';
import { RouteName } from '@/types/renderer/router';
import { clearSessionStorage } from '@/src/utils/hub';
import type { RootSchema, ModulesSchema } from '@/types/schema';

const store = useStore<RootSchema & ModulesSchema>();
const { t } = useI18n();
const router = useRouter();

/** True, if logout request is being processed */
const isLoading = ref(false);

/** Twitch client ID */
const clientId = computed(() => store.state.clientId);

/** Logined user name */
const userName = computed(() => store.state.user.name);

/** Logined user access token */
const userAccessToken = computed(() => store.state.user.token);

/**
 * Log out current user and go to auth screen
 */
async function logout (): Promise<void> {
  if (isLoading.value) {
    return;
  }

  isLoading.value = true;

  await store.dispatch(REVOKE_USER_ACCESS_TOKEN, {
    clientId: clientId.value,
    token: userAccessToken.value,
  });

  isLoading.value = false;

  store.dispatch(TOGGLE_APP_SETTINGS);
  store.dispatch(RESET_LIBRARY);
  router.replace({ name: RouteName.Auth });

  clearSessionStorage();
}
</script>
