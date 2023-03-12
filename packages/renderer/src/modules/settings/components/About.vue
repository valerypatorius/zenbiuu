<template>
  <div class="settings-section">
    <div class="settings-section__title">
      {{ hubState.app.name }} {{ t('version') }} {{ hubState.app.version }}
    </div>

    <p>
      {{ t('settings.about.issue') }}
      <a href="https://github.com/valerypatorius/zenbiuu">GitHub</a>
    </p>

    <p>
      {{ t('settings.about.iconBy') }} <a href="https://www.iconfinder.com/icons/5296664/monkey_japan_japanese_onsen_hot_icon">Maxicons</a><br>
      {{ t('settings.about.interfaceIcons') }} <a href="https://boxicons.com/">Boxicons</a><br>
    </p>

    <p class="settings__secondary">
      {{ t('legal.disclaimer') }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useHub } from '@/src/infrastructure/hub/useHub';

const { t } = useI18n();
const { state: hubState } = useHub();
</script>
