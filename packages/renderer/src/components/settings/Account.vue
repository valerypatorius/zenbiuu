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
import { clearSessionStorage } from '@/src/utils/hub';
import { useUserState } from '@/src/store/useUserState';
import { useInterfaceState } from '@/src/store/useInterfaceState';
import { useLibraryState } from '@/src/store/useLibraryState';

const { t } = useI18n();
const router = useRouter();
const { state: userState, deauthorize } = useUserState();
const { state: interfaceState } = useInterfaceState();
const { reset: resetLibrary } = useLibraryState();

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
  interfaceState.isSettingsActive = false;

  resetLibrary();

  router.replace({ name: RouteName.Auth });

  clearSessionStorage();
}
</script>
