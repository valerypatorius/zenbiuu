<template>
  <div class="settings-section">
    <div class="settings-section__title">
      {{ t('settings.locale.change') }}
    </div>

    <radio
      v-for="option in localeOptions"
      :id="option.name"
      :key="option.name"
      :value="option.name"
      :checked="option.checked"
      name="locale"
      @change="setAppLocale(option.name)"
    >
      {{ option.label }}
    </radio>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useStore } from 'vuex';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import Radio from '@/src/components/ui/Radio.vue';
import { updateWindowTitle } from '@/src/router/index';
import { SET_APP_LOCALE } from '@/src/store/actions';
import { AppLocaleName, AppLocaleDisplayName } from '@/types/renderer/locale';
import type { RootSchema, ModulesSchema } from '@/types/schema';

interface LocaleOption {
  name: AppLocaleName;
  label: AppLocaleDisplayName;
  checked: boolean;
}

const store = useStore<RootSchema & ModulesSchema>();
const { t, locale } = useI18n();
const route = useRoute();

/** Available locale options */
const localeOptions = computed(() => {
  const result: LocaleOption[] = [];

  Object.entries(AppLocaleName).forEach(([key, name]) => {
    const label = AppLocaleDisplayName[key as keyof typeof AppLocaleDisplayName];

    result.push({
      name,
      label,
      checked: name === locale.value,
    });
  });

  return result;
});

/**
 * Set app locale and update window title
 */
function setAppLocale (value: AppLocaleName): void {
  locale.value = value;
  store.dispatch(SET_APP_LOCALE, value);

  updateWindowTitle(route);
}
</script>
