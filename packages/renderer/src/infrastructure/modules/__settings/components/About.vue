<template>
  <div class="settings-section">
    <div class="settings-section__title">
      {{ hubState.app.name }} {{ t('version') }} {{ hubState.app.version }}
    </div>

    <p>
      {{ t('settings.about.issue') }}
      <a href="https://github.com/valerypatorius/zenbiuu/issues">GitHub</a>
    </p>

    <p class="settings__secondary">
      {{ t('legal.disclaimer', { name: hubState.app.name }) }}
    </p>
  </div>

  <div class="settings-section">
    <p>
      {{ t('settings.about.iconBy') }} <a href="https://www.iconfinder.com/icons/5296664/monkey_japan_japanese_onsen_hot_icon">Maxicons</a><br>
      {{ t('settings.about.interfaceIcons') }} <a href="https://boxicons.com/">Boxicons</a><br>
    </p>
  </div>

  <div class="settings-section">
    <div class="settings-section__title">
      {{ updateMessage }}
      <Loader v-if="isCheckingUpdate" />
    </div>

    <p v-if="update !== undefined">
      <button
        :disabled="isDownloading"
        @click="onUpdateButtonClick"
      >
        <Loader v-if="isDownloading" />
        {{ updateButtonText }}
      </button>
    </p>

    <p>
      {{ t('settings.about.updateProblems') }}
      <a href="https://github.com/valerypatorius/zenbiuu/releases/latest">
        {{ t('settings.about.updateManualDownload') }}
      </a>
    </p>

    <p
      v-if="releaseNotesHtml"
      v-html="releaseNotesHtml"
    />
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { computed, onMounted } from 'vue';
import { useHub } from '@/src/infrastructure/hub/useHub';
import { useUpdater } from '@/src/infrastructure/updater/useUpdater';
import Loader from '@/src/modules/ui/components/Loader.vue';

const { t } = useI18n();
const { state: hubState } = useHub();
const { update, check, download, install, isChecking: isCheckingUpdate, isDownloading, isReadyToInstall, releaseNotesHtml } = useUpdater();

const updateMessage = computed(() => {
  if (isCheckingUpdate.value) {
    return t('settings.about.updateChecking');
  }

  return update.value !== undefined ? t('settings.about.updateAvailable') : t('settings.about.updateNotNeeded');
});

const updateButtonText = computed(() => {
  if (isReadyToInstall.value) {
    return t('settings.about.updateInstall');
  }

  return isDownloading.value ? t('settings.about.updateDownloading') : t('settings.about.updateDownload');
});

function onUpdateButtonClick () {
  if (isDownloading.value) {
    return;
  }

  if (isReadyToInstall.value) {
    install();

    return;
  }

  download();
}

onMounted(() => {
  check();
});
</script>
