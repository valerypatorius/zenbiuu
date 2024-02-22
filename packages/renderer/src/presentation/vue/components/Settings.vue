<template>
  <div
    class="settings-overlay"
    @click.self="toggleSettingsState()"
  >
    <div class="settings">
      <Scrollable>
        <div class="settings__main">
          <!-- Accounts management -->
          <div
            v-if="accounts.length > 0"
            class="settings__section"
          >
            <div class="settings__section-title">
              {{ t('settings.account.title') }}
            </div>

            <div class="accounts">
              <div class="accounts__list">
                <ChannelCard
                  v-for="account in accounts"
                  :key="`${account.provider}:${account.token}`"
                  :name="account.name"
                  :details="account.tokenExpirationDate"
                  :avatar="account.avatar"
                >
                  <div class="settings__account-actions">
                    <IconButton
                      icon="crown"
                      :size="20"
                      :active="isPrimaryAccount(account)"
                      :disabled="isPrimaryAccount(account)"
                      @click="primaryAccount = account"
                    />

                    <IconButton
                      icon="trash"
                      :size="20"
                      @click="logout(account)"
                    />
                  </div>
                </ChannelCard>
              </div>

              <div class="accounts__footer">
                <IconButton
                  v-for="provider in availableProviders"
                  :key="provider.name"
                  icon="plus"
                  @click="login(provider.name)"
                />
              </div>
            </div>
          </div>
        </div>
      </Scrollable>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useAccount } from '../services/useAccount';
import { useProviders } from '../services/useProviders';
import { useSettings } from '../services/useSettings';
import Scrollable from './ui/Scrollable.vue';
import ChannelCard from './ChannelCard.vue';
import IconButton from './ui/IconButton.vue';

const { t } = useI18n();
const { accounts, login, logout, isPrimaryAccount, primaryAccount } = useAccount();
const { available: availableProviders } = useProviders();
const { toggleState: toggleSettingsState } = useSettings();

/**
 * @todo Settings
 * - compact/default mode;
 * - performance mode with fancy stuff disabled (blur, etc.);
 * - smooth scroll in chat;
 */
</script>

<style lang="postcss">
@import '@/presentation/styles/typography.pcss';

.settings-overlay {
  /* background-color: rgba(29, 29, 34, 0.8); */
  position: fixed;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  z-index: 9;
  /* backdrop-filter: blur(20px); */
}

.settings {
  display: grid;
  width: 360px;
  height: 100%;
  padding: 16px;
  padding-top: var(--layout-titlebar-height);
  background-color: color-mix(in srgb, #000 10%, var(--theme-color-background));
  box-shadow: 100px 0 120px -50px var(--theme-color-shadow);

  &__section-title {
    @extend %text-small;
    color: var(--theme-color-text-secondary);
    margin: 12px 0;
  }

  &__about {
    @extend %text-small;
  }

  &__account-actions {
    display: flex;
    gap: 4px;
  }
}

.accounts {
  display: grid;
  gap: 12px;

  &__list {
    display: grid;
    gap: 12px;
  }
}
</style>
