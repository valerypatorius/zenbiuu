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
          v-for="(tab, tabName) in tabs"
          :key="tabName"
          :class="[
            'settings-tab',
            {
              'settings-tab--active': tabName === activeTab,
            },
          ]"
          @click="activeTab = tabName"
        >
          <icon :name="tab.icon" />
          {{ tab.label }}
        </div>
      </div>

      <div class="settings__content scrollable">
        <component :is="`settings-${activeTab}`" />
      </div>
    </div>
  </popup>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import Icon from '@/src/components/ui/Icon.vue';
import Popup from '@/src/components/ui/Popup.vue';
import SettingsInterface from '@/src/components/settings/Interface.vue';
import SettingsLocale from '@/src/components/settings/Locale.vue';
import SettingsAccount from '@/src/components/settings/Account.vue';
import SettingsAbout from '@/src/components/settings/About.vue';
import SettingsUpdate from '@/src/components/settings/Update.vue';
import { capitalizeFirstChar } from '@/src/utils/utils';
import { state } from '@/src/utils/hub';
import { AppUpdateStatus } from '@/types/hub';
import { TOGGLE_APP_SETTINGS } from '@/src/store/actions';
import type { IconString } from '@/assets/icons';

/**
 * Available settings tabs
 */
enum Tab {
  Interface = 'interface',
  Locale = 'locale',
  Account = 'account',
  About = 'about',
  Update = 'update',
}

type Tabs = Record<Tab, {label: string; icon: IconString}>;

export default defineComponent({
  name: 'Settings',
  components: {
    Icon,
    Popup,
    SettingsInterface,
    SettingsLocale,
    SettingsAccount,
    SettingsAbout,
    SettingsUpdate,
  },
  data (): {
    Tab: typeof Tab;
    activeTab: Tab;
    } {
    return {
      /**
       * Available tabs names
       */
      Tab,

      /**
       * Currently active tab.
       * If update is available, force "update" tab to be active
       */
      activeTab: state.appUpdateStatus === AppUpdateStatus.Available ? Tab.Update : Tab.Interface,
    };
  },
  computed: {
    /**
     * Logined user access token
     */
    userAccessToken (): string | null {
      return this.$store.state.user.token;
    },

    /**
     * Returns true, if app update is available
     */
    isUpdateAvailable (): boolean {
      return state.appUpdateStatus === AppUpdateStatus.Available ||
        state.appUpdateStatus === AppUpdateStatus.Downloading ||
        state.appUpdateStatus === AppUpdateStatus.ReadyForInstall;
    },

    /**
     * Tabs list to render
     */
    tabs (): Tabs {
      return Object.values(Tab).reduce((result: Tabs, name: Tab) => {
        if (name === Tab.Account && !this.userAccessToken) {
          return result;
        }

        if (name === Tab.Update && !this.isUpdateAvailable) {
          return result;
        }

        result[name] = {
          label: this.$t(`settings.${name}.title`),
          icon: `Settings${capitalizeFirstChar(name)}`,
        };

        return result;
      }, {} as Tabs);
    },
  },
  methods: {
    /**
     * Close settings popup
     */
    closeSettings (): void {
      this.$store.dispatch(TOGGLE_APP_SETTINGS);
    },
  },
});
</script>

<style>
  .settings {
    display: grid;
    grid-template-columns: 20rem 1fr;
    grid-template-rows: auto 1fr;
    gap: 0 4rem;
    height: 100%;
  }

  .settings__header {
    grid-column: span 2;
    padding: 1.6rem 1.6rem 1.6rem 3rem;
    font-weight: 500;
    font-size: 1.6rem;
    line-height: 1.5em;
    color: var(--color-text-secondary);
    display: flex;
    align-items: center;
  }

  .settings__tabs {
    padding: 0 1.6rem 2rem;
  }

  .settings__content {
    padding: 1rem 1.6rem 2rem 0;
  }

  .settings__close {
    margin-left: auto;
    cursor: pointer;
    border-radius: var(--border-radius);
    color: var(--color-text-tertiary)
  }

  .settings__close:hover {
    background-color: var(--color-control-semiactive);
  }

  .settings__close .icon {
    width: 3rem;
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
  }

  .settings-tab:not(:last-child) {
    margin-bottom: 0.6rem;
  }

  .settings-tab .icon {
    width: 2rem;
    margin-right: 1rem;
    margin-top: 0.1rem;
    color: var(--color-text-tertiary);
  }

  .settings-tab--active {
    background-color: var(--color-control-active);
    color: var(--color-text);
    pointer-events: none;
  }

  .settings-tab--active .icon {
    color: var(--color-text);
  }

  .settings-tab:hover {
    background-color: var(--color-control-semiactive);
  }

  /** Common styles for sections blocks */
  .settings-section:not(:last-child) {
    margin-bottom: 3.2rem;
  }

  .settings-section .checkbox:not(:last-child),
  .settings-section .radio:not(:last-child) {
    margin-bottom: 2rem;
  }

  .settings-section__title {
    font-size: 1.4rem;
    line-height: 1.6em;
    color: var(--color-text-secondary);
    margin-bottom: 1.6rem;
    display: flex;
    align-items: center;
  }

  .settings-section img {
    --size: 12.8rem;

    width: var(--size);
    height: var(--size);
  }

  .settings__secondary {
    color: var(--color-text-secondary);
  }

  /** Common styles for actions blocks */
  .settings-action {
    display: grid;
    grid-template-columns: 1fr auto;
    align-items: center;
    gap: 24px;
  }

  .settings-action:not(:last-child) {
    margin-bottom: 3rem;
  }

  .settings-action a:not(.button) {
    color: var(--color-text-secondary);
  }

  .settings-action a:not(.button):hover {
    color: var(--color-text);
  }
</style>
