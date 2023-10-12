<template>
  <Transition name="settings">
    <div
      v-if="isSettingsOpened"
      class="settings scrollable"
    >
      <!-- Accounts management -->
      <div
        v-if="accounts.length > 0"
        class="settings__section"
      >
        <div class="settings__section-title">
          {{ t('settings.account.title') }}
        </div>

        <Account
          v-for="account in accounts"
          :key="`${account.provider}:${account.token}`"
          v-bind="account"
          :is-primary="isPrimaryAccount(account)"
          @remove="logout(account)"
          @select="setPrimaryAccount(account)"
        />

        <Button
          v-for="provider in availableProviders"
          :key="provider.name"
          @click="login(provider.name)"
        >
          Добавить {{ provider.displayName }}
        </Button>
      </div>

      <div class="settings__section">
        <div class="settings__section-title">
          {{ t('settings.colorScheme.title') }}
        </div>
      </div>

      <div class="settings__section">
        <div class="settings__section-title">
          {{ t('settings.locale.title') }}
        </div>
      </div>

      <div class="settings__section">
        <div class="settings__section-title">
          {{ app.name }} {{ app.version }}
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useHub } from '../services/useHub';
import { useSettings } from '../services/useSettings';
import { useAccount } from '../services/useAccount';
import { useProviders } from '../services/useProviders';
import Account from './Account.vue';
import Button from '@/presentation/vue/components/ui/Button.vue';

const { t } = useI18n();
const { app } = useHub();
const { state: isSettingsOpened } = useSettings();
const { accounts, login, logout, isPrimaryAccount, setPrimaryAccount } = useAccount();
const { available: availableProviders } = useProviders();
</script>

<style lang="postcss">
@import '@/presentation/styles/typography.pcss';

.settings {
  width: 420px;
  /* border-radius: 0 12px 12px 0; */
  position: fixed;
  top: var(--layout-titlebar-height);
  bottom: 0;
  left: 0;
  background-color: var(--theme-color-background);
  box-shadow: 10px 0 40px -40px var(--theme-color-shadow);
  /* border-right: 1px solid var(--theme-color-text-tertiary); */
  z-index: 2;

  &__title {
    @extend %text-small;
    height: var(--layout-titlebar-height);
    display: flex;
    align-items: center;
    padding: 0 20px;
    /* margin-left: 40px; */
  }

  &__section-title {
    @extend %text-small;
    color: var(--theme-color-text-secondary);
  }

  &__section {
    display: grid;
    gap: 12px;
    padding: 20px;

    .button {
      justify-self: start;
      margin-top: 12px;
    }
  }

  &__about {
    @extend %text-small;
  }
}

.settings-enter-active {
  transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.settings-leave-active {
  transition: all 0.05s ease-in;
}

.settings-enter-from {
  transform: translateX(-20px);
  opacity: 0;
}

.settings-leave-to {
  transform: translateX(-5px);
  opacity: 0;
}
</style>
