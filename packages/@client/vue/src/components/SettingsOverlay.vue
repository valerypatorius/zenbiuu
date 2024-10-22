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
                <div
                  v-for="account in accounts"
                  :key="`${account.provider}:${account.token}`"
                  class="accounts__item"
                >
                  <ChannelCard
                    :name="account.name"
                    :details="
                      t('validUntilDate', {
                        date: new Intl.DateTimeFormat(locale, {
                          dateStyle: 'short',
                          timeStyle: 'short',
                        }).format(new Date(account.tokenExpirationDate ?? '')),
                      })
                    "
                    :avatar="account.avatar"
                    :is-ignore-compact="true"
                  />

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
                </div>
              </div>

              <div class="accounts__footer">
                <IconButton
                  v-for="provider in availableProviders"
                  :key="provider.name"
                  icon="plus"
                  :size="22"
                  @click="login(provider.name)"
                />
              </div>
            </div>
          </div>

          <div class="settings__section">
            <div class="settings__section-title">
              {{ t('settings.interface.title') }}
            </div>

            <Checkbox v-model:value="isCompactLayout">
              {{ t('settings.interface.compactLayout') }}
            </Checkbox>

            <Checkbox v-model:value="isSmoothScrollEnabled">
              {{ t('settings.interface.smoothScroll') }}
            </Checkbox>
          </div>

          <div class="settings__section">
            <div class="settings__section-title">
              {{ t('settings.player.title') }}
            </div>

            <Checkbox v-model:value="isAudioCompressorEnabled">
              {{ t('settings.player.compressor.enable') }}
            </Checkbox>
          </div>

          <!-- Locale management -->
          <!-- <div class="settings__section">
            <div class="settings__section-title">
              {{ t('settings.locale.title') }}
            </div>

            <DropdownSelect
              v-model="locale"
              :options="
                availableLocales.map((value) => ({
                  value,
                  label: capitalize(new Intl.DisplayNames([value], { type: 'language' }).of(value) ?? value),
                }))
              "
            />
          </div> -->

          <!-- Color scheme management -->
          <!-- <div class="settings__section">
            <div class="settings__section-title">
              {{ t('settings.colorScheme.title') }}
            </div>

            <DropdownSelect
              :options="
                availableLocales.map((value) => ({
                  value,
                  label: capitalize(new Intl.DisplayNames([value], { type: 'language' }).of(value) ?? value),
                }))
              "
              :modelValue="locale"
              @update:modelValue="
                (value) => {
                  locale = value;
                }
              "
            />
          </div> -->

          <!-- <div class="settings__section">
            <div class="settings__section-title">
              {{ app.name }}@{{ app.version }}
            </div>
          </div> -->
        </div>
      </Scrollable>
    </div>
  </div>
</template>

<script setup lang="ts">
import { capitalize } from '@zenbiuu/shared';
import { useI18n } from 'vue-i18n';
import { useAccount } from '~/services/useAccount';
import { useProviders } from '~/services/useProviders';
import { useSettings } from '~/services/useSettings';
import ChannelCard from './ChannelCard.vue';
import DropdownSelect from './ui/DropdownSelect';
import IconButton from './ui/IconButton.vue';
import Scrollable from './ui/Scrollable.vue';
import Checkbox from './ui/Checkbox';
import { useHub } from '~/services/useHub';

const { t, locale, availableLocales } = useI18n();
const { app } = useHub();
const { accounts, login, logout, isPrimaryAccount, primaryAccount } =
  useAccount();
const { available: availableProviders } = useProviders();
const {
  toggleState: toggleSettingsState,
  isAudioCompressorEnabled,
  isCompactLayout,
  isSmoothScrollEnabled,
} = useSettings();

/**
 * @todo Settings
 * - performance mode with fancy stuff disabled (blur, etc.);
 * - smooth scroll in chat;
 */
</script>

<style lang="postcss">
@import '~/styles/typography.pcss';

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
  padding-top: var(--layout-titlebar-height);
  background-color: color-mix(in srgb, #000 10%, var(--theme-color-background));
  box-shadow: 100px 0 120px -50px var(--theme-color-shadow);

  &__main {
    display: grid;
    gap: 8px;
    padding: 16px;
    padding-top: 0;
  }

  &__section {
    display: grid;
    gap: 12px;
    margin-top: 12px;
  }

  &__section-title {
    @extend %text-small;
    color: var(--theme-color-text-secondary);
  }

  &__account-actions {
    display: flex;
    gap: 4px;
  }

  &__footer {
    @extend %text-small;
    color: var(--theme-color-text-secondary);
    margin-top: auto;
  }
}

.accounts {
  display: grid;
  gap: 12px;

  &__list {
    display: grid;
    gap: 12px;
  }

  &__item {
    display: grid;
    grid-template-columns: 1fr auto;
    align-items: center;
  }
}
</style>
