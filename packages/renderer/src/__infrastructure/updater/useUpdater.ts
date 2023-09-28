import { marked } from 'marked';
import { createSharedComposable } from '@vueuse/core';
import { type UpdateInfo } from 'electron-updater';
import { ref, computed } from 'vue';
import { useHub } from '../hub/useHub';

export const useUpdater = createSharedComposable(() => {
  const { updater } = useHub();

  const update = ref<UpdateInfo>();

  const releaseNotesHtml = computed(() => {
    if (typeof update.value?.releaseNotes !== 'string') {
      return '';
    }

    return marked.parse(update.value.releaseNotes);
  });

  const isChecking = ref(false);
  const isDownloading = ref(false);
  const isReadyToInstall = ref(false);
  const isLatestVersion = ref(false);

  async function check (): Promise<void> {
    if (update.value !== undefined || isChecking.value) {
      return;
    }

    isChecking.value = true;
    update.value = await updater.check();
    isLatestVersion.value = update.value === undefined;
    isChecking.value = false;
  }

  async function download (): Promise<void> {
    if (isDownloading.value) {
      return;
    }

    try {
      isDownloading.value = true;

      await updater.download();

      isReadyToInstall.value = true;
    } finally {
      isDownloading.value = false;
    }
  }

  function install (): void {
    if (!isReadyToInstall.value) {
      return;
    }

    updater.install();
  }

  return {
    update,
    check,
    download,
    install,
    isChecking,
    isDownloading,
    isReadyToInstall,
    isLatestVersion,
    releaseNotesHtml,
  };
});
