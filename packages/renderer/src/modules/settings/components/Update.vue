<template>
  <div
    v-if="isMac()"
    class="settings-section"
  >
    <div class="settings-action">
      <div class="settings-action__main">
        {{ t('settings.update.macWarning') }}
      </div>

      <a
        class="button"
        href="https://github.com/valerypatorius/zenbiuu/releases"
      >
        {{ t('settings.update.download') }}
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
        {{ t('settings.update.available') }}
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

<script setup lang="ts">
import { marked } from 'marked';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { downloadAppUpdate, installAppUpdate } from '@/src/infrastructure/hub/hub';
import { isMac } from '@/src/utils/utils';
import { useHub } from '@/src/store/useHub';
import { AppUpdateStatus } from '@/types/renderer/update';

const { t } = useI18n();
const { state: hubState } = useHub();

/** Current app update status */
const appUpdateStatus = computed(() => hubState.appUpdateStatus);

/** Download progress percentage */
const downloadProgress = computed(() => {
  if (!hubState.appUpdateProgress) {
    return 0;
  }

  return Math.round(hubState.appUpdateProgress.percent);
});

/** True, if update is downloading */
const isDownloading = computed(() => appUpdateStatus.value === AppUpdateStatus.Downloading);

/** Text label for action button */
const buttonLabel = computed(() => {
  let label = '';

  switch (appUpdateStatus.value) {
    case (AppUpdateStatus.Available):
      label = t('settings.update.download');
      break;
    case (AppUpdateStatus.Downloading):
      label = t('settings.update.downloading') + ` ${downloadProgress.value}%`;
      break;
    case (AppUpdateStatus.ReadyForInstall):
      label = t('settings.update.ready');
      break;
  }

  return label;
});

/** Release notes html. Parsed from markdown string */
const releaseNotes = computed(() => {
  if (!hubState.appUpdateData || !hubState.appUpdateData.releaseNotes) {
    return '';
  }

  const { releaseNotes } = hubState.appUpdateData;
  const markedOptions = {
    headerIds: false,
  };

  if (Array.isArray(releaseNotes)) {
    return releaseNotes.map((info) => info.note ? marked(info.note, markedOptions) : '').join('');
  }

  return marked(releaseNotes, markedOptions);
});

/**
 * Perform action, according to current update status
 */
function onActionButtonClick (): void {
  if (isDownloading.value) {
    return;
  }

  switch (appUpdateStatus.value) {
    case AppUpdateStatus.ReadyForInstall:
      installAppUpdate();
      break;
    case AppUpdateStatus.Available:
      downloadAppUpdate();
      break;
  }
}
</script>
