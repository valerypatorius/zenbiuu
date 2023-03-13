import { createSharedComposable } from '@vueuse/core';
import { type UpdateInfo } from 'electron-updater';
import { ref } from 'vue';
import { useHub } from '../hub/useHub';

export const useUpdater = createSharedComposable(() => {
  const { updater } = useHub();

  const update = ref<UpdateInfo>();

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

    isDownloading.value = true;

    await updater.download();

    isDownloading.value = false;
    isReadyToInstall.value = true;
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
  };
});
