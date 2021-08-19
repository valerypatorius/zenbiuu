<template>
  <div
    v-if="isMac"
    class="settings-section"
  >
    <div class="settings-action">
      <div class="settings-action__main">
        {{ $t('settings.update.macWarning') }}
      </div>

      <a
        class="button"
        href="https://github.com/valerypatorius/zenbiuu/releases"
      >
        {{ $t('settings.update.download') }}
      </a>
    </div>

    <div
      v-if="releaseNotes"
      v-html="releaseNotes"
    />
  </div>

  <div
    v-else
    class="settings-section"
  >
    <div class="settings-action">
      <div class="settings-action__main">
        {{ $t('settings.update.available') }}
      </div>

      <button
        v-if="buttonLabel"
        :disabled="isDownloading"
        @click="onActionButtonClick"
      >
        {{ buttonLabel }}
      </button>
    </div>

    <div
      v-if="releaseNotes"
      v-html="releaseNotes"
    />
  </div>
</template>

<script lang="ts">
import marked from 'marked';
import { defineComponent } from 'vue';
import { state, downloadAppUpdate, installAppUpdate } from '@/src/utils/hub';
import { isMac } from '@/src/utils/utils';
import { AppUpdateStatus } from '@/types/hub';

export default defineComponent({
  name: 'SettingsUpdate',
  data (): {
    isMac: boolean;
    } {
    return {
      /**
       * Returns true, if current platform is Mac
       */
      isMac: isMac(),
    };
  },
  computed: {
    /**
     * Current app update status
     */
    appUpdateStatus (): AppUpdateStatus {
      return state.appUpdateStatus;
    },

    /**
     * Download progress percentage
     */
    downloadProgress (): number {
      if (!state.appUpdateProgress) {
        return 0;
      }

      return Math.round(state.appUpdateProgress.percent);
    },

    /**
     * App version available for download
     */
    availableVersion (): string {
      return state.appUpdateData ? state.appUpdateData.version : '';
    },

    /**
     * True, if update is downloading
     */
    isDownloading (): boolean {
      return this.appUpdateStatus === AppUpdateStatus.Downloading;
    },

    /**
     * Text label for action button
     */
    buttonLabel (): string {
      let label = '';

      switch (this.appUpdateStatus) {
        case (AppUpdateStatus.Available):
          label = this.$t('settings.update.download');
          break;
        case (AppUpdateStatus.Downloading):
          label = this.$t('settings.update.downloading') + ` ${this.downloadProgress}%`;
          break;
        case (AppUpdateStatus.ReadyForInstall):
          label = this.$t('settings.update.ready');
          break;
      }

      return label;
    },

    /**
     * Release notes html. Parsed from markdown string
     */
    releaseNotes (): string {
      if (!state.appUpdateData || !state.appUpdateData.releaseNotes) {
        return '';
      }

      const { releaseNotes } = state.appUpdateData;
      const markedOptions = {
        headerIds: false,
      };

      if (Array.isArray(releaseNotes)) {
        return releaseNotes.map((info) => info.note ? marked(info.note, markedOptions) : '').join('');
      }

      return marked(releaseNotes, markedOptions);
    },
  },
  methods: {
    /**
     * Perform action, according to current update status
     */
    onActionButtonClick (): void {
      if (this.isDownloading) {
        return;
      }

      switch (this.appUpdateStatus) {
        case AppUpdateStatus.ReadyForInstall:
          installAppUpdate();
          break;
        case AppUpdateStatus.Available:
          downloadAppUpdate();
          break;
      }
    },
  },
});
</script>
