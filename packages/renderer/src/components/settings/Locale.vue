<template>
  <div class="settings-section">
    <div class="settings-section__title">
      {{ $t('settings.locale.change') }}
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

<script lang="ts">
import { defineComponent } from 'vue';
import Radio from '@/src/components/ui/Radio.vue';
import { updateWindowTitle } from '@/src/router/index';
import { SET_APP_LOCALE } from '@/src/store/actions';
import { AppLocaleName, AppLocaleDisplayName } from '@/types/renderer/locale';

interface LocaleOption {
  name: AppLocaleName;
  label: AppLocaleDisplayName;
  checked: boolean;
}

export default defineComponent({
  name: 'SettingsLocale',
  components: {
    Radio,
  },
  computed: {
    /**
     * Available locale options
     */
    localeOptions (): LocaleOption[] {
      const result: LocaleOption[] = [];

      Object.entries(AppLocaleName).forEach(([key, name]) => {
        const label = AppLocaleDisplayName[key as keyof typeof AppLocaleDisplayName];

        result.push({
          name,
          label,
          checked: name === this.$i18n.locale,
        });
      });

      return result;
    },
  },
  methods: {
    /**
     * Set app locale and update window title
     */
    setAppLocale (value: AppLocaleName): void {
      this.$i18n.locale = value;
      this.$store.dispatch(SET_APP_LOCALE, value);

      updateWindowTitle(this.$route);
    },
  },
});
</script>
