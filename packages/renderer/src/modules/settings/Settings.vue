<template>
  <popup @close="closeSettings">
    <div class="settings">
      <div class="settings__header">
        {{ $t('settings.title') }}

        <div
          class="settings__close"
          @click="closeSettings"
        >
          <icon name="Close" />
        </div>
      </div>

      <div class="settings__tabs">
        <div
          v-for="(tabData, tabName) in availableTabs"
          :key="tabName"
          :class="[
            'settings-tab',
            {
              'settings-tab--active': tabName === activeTabName,
            },
          ]"
          @click="(activeTabName = tabName as TabName)"
        >
          <icon :name="tabData.icon" />
          {{ tabData.label }}
        </div>
      </div>

      <div class="settings__content scrollable">
        <component :is="Tab[activeTabName].component" />
      </div>
    </div>
  </popup>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import type { Component } from 'vue';
import Icon from '@/src/modules/ui/components/Icon.vue';
import Popup from '@/src/modules/core/components/Popup.vue';
import SettingsInterface from '@/src/modules/settings/components/Interface.vue';
import SettingsLocale from '@/src/modules/settings/components/Locale.vue';
import SettingsAccount from '@/src/modules/settings/components/Account.vue';
import SettingsAbout from '@/src/modules/settings/components/About.vue';
import { useUser } from '@/src/modules/auth/useUser';
import { useInterface } from '@/src/infrastructure/interface/useInterface';

enum TabName {
  Interface = 'interface',
  Locale = 'locale',
  Account = 'account',
  About = 'about',
}

interface TabData {
  label: string;
  icon: string;
  component: Component;
}

const { t } = useI18n();
const { state: userState } = useUser();
const { isSettingsActive } = useInterface();

/** Logined user access token */
const userAccessToken = computed(() => userState.token);

const Tab = computed<Record<TabName, TabData>>(() => {
  return {
    [TabName.Interface]: {
      label: t('settings.interface.title'),
      icon: 'SettingsInterface',
      component: SettingsInterface,
    },
    [TabName.Locale]: {
      label: t('settings.locale.title'),
      icon: 'SettingsLocale',
      component: SettingsLocale,
    },
    [TabName.Account]: {
      label: t('settings.account.title'),
      icon: 'SettingsAccount',
      component: SettingsAccount,
    },
    [TabName.About]: {
      label: t('settings.about.title'),
      icon: 'SettingsAbout',
      component: SettingsAbout,
    },
  };
});

/**
 * Currently active tab
 */
const activeTabName = ref(TabName.Interface);

/** Tabs list to render */
const availableTabs = computed(() => {
  return Object.entries(Tab.value).reduce<Record<string, TabData>>((result, [tabName, tabData]) => {
    if (tabName === TabName.Account && !userAccessToken.value) {
      return result;
    }

    result[tabName as TabName] = tabData;

    return result;
  }, {});
});

/** Close settings popup */
function closeSettings (): void {
  isSettingsActive.value = false;
}
</script>

<style lang="postcss">
  .settings {
    display: grid;
    grid-template-columns: 20rem 1fr;
    grid-template-rows: auto 1fr;
    gap: 0 4rem;
    height: 100%;

    &__header {
      grid-column: span 2;
      padding: 1.6rem 1.6rem 1.6rem 3rem;
      font-weight: 500;
      font-size: 1.6rem;
      line-height: 1.5em;
      color: var(--color-text-secondary);
      display: flex;
      align-items: center;
    }

    &__tabs {
      --icon-opacity: 0.7;
      padding: 0 1.6rem 2rem;
    }

    &__content {
      padding: 1rem 1.6rem 2rem 0;
    }

    &__close {
      margin-left: auto;
      cursor: pointer;
      border-radius: var(--border-radius);
      color: var(--color-text-tertiary);

      &:hover {
        background-color: var(--color-control-semiactive);
      }

      .icon {
        width: 3rem;
      }
    }

    &__secondary {
      color: var(--color-text-secondary);
    }
  }

  /** Single tab appearance */
  .settings-tab {
    height: 4rem;
    display: flex;
    align-items: center;
    color: var(--color-text-secondary);
    padding: 0 2rem 0 1rem;
    cursor: pointer;
    white-space: nowrap;
    border-radius: var(--border-radius);
    position: relative;
    z-index: 1;
    overflow: hidden;

    &:not(:last-child) {
      margin-bottom: 0.6rem;
    }

    .icon {
      width: 2rem;
      margin-right: 1rem;
      margin-top: 0.1rem;
      color: var(--color-text-tertiary);
    }

    &--active {
      background-color: var(--color-control-active);
      color: var(--color-text);
      pointer-events: none;

      .icon {
        color: var(--color-text);
      }
    }

    &:hover {
      background-color: var(--color-control-semiactive);
    }
  }

  /** Common styles for sections blocks */
  .settings-section {
    &:not(:last-child) {
      margin-bottom: 3.2rem;
    }

    .checkbox:not(:last-child),
    .radio:not(:last-child) {
      margin-bottom: 2rem;
    }

    &__title {
      font-size: 1.4rem;
      line-height: 1.6em;
      color: var(--color-text-secondary);
      margin-bottom: 1.6rem;
      display: flex;
      align-items: center;
    }

    img {
      --size: 12.8rem;

      width: var(--size);
      height: var(--size);
    }
  }

  /** Common styles for actions blocks */
  .settings-action {
    display: grid;
    grid-template-columns: 1fr auto;
    align-items: center;
    gap: 24px;

    &:not(:last-child) {
      margin-bottom: 3rem;
    }

    a:not(.button) {
      color: var(--color-text-secondary);

      &:hover {
        color: var(--color-text);
      }
    }
  }
</style>
