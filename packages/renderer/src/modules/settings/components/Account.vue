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
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { RouteName } from '@/types/renderer/router';
import { clearSessionStorage } from '@/src/infrastructure/hub/hub';
import { useUser } from '@/src/store/useUser';
import { useAuth } from '@/src/store/useAuth';
import { useInterface } from '@/src/infrastructure/interface/useInterface';
import { useLibrary } from '@/src/store/useLibrary';

const { t } = useI18n();
const router = useRouter();
const { state: userState } = useUser();
const { deauthorize } = useAuth();
const { isSettingsActive } = useInterface();
const { reset: resetLibrary } = useLibrary();

/** True, if logout request is being processed */
const isLoading = ref(false);

/** Logined user name */
const userName = computed(() => userState.name);

/** Logined user access token */
const userAccessToken = computed(() => userState.token);

/**
 * Log out current user and go to auth screen
 */
async function logout (): Promise<void> {
  if (isLoading.value) {
    return;
  }

  isLoading.value = true;

  await deauthorize();

  isLoading.value = false;
  isSettingsActive.value = false;

  resetLibrary();

  router.replace({ name: RouteName.Auth });

  clearSessionStorage();
}
</script>
