<template>
  <!-- Interface settings -->
  <div class="settings-section">
    <div class="settings-section__title">
      {{ t('settings.interface.general') }}
    </div>

    <checkbox
      v-for="setting in interfaceSettings"
      :key="setting.name"
      :value="setting.value"
      @change="toggleSetting(setting.name)"
    >
      {{ t(`settings.interface.${setting.name}`) }}
    </checkbox>
  </div>

  <!-- Interface size -->
  <div class="settings-section">
    <div class="settings-section__title">
      {{ t('settings.interface.size') }}
    </div>

    <div class="settings-slider">
      <input
        type="range"
        tabindex="-1"
        :min="InterfaceSize.Min"
        :max="InterfaceSize.Max"
        step="1"
        :value="currentInterfaceSize"
        @change="setInterfaceSize(null, $event)"
      >

      <div class="settings-slider__values">
        <div
          v-for="(n, i) in InterfaceSize.Max - InterfaceSize.Min + 1"
          :key="i"
          :class="[
            'settings-slider__value',
            {
              'settings-slider__value--active': currentInterfaceSize === i + InterfaceSize.Min,
            },
          ]"
          @click="setInterfaceSize(i + InterfaceSize.Min)"
        >
          {{ i % 2 === 0 ? i + InterfaceSize.Min : '' }}
        </div>
      </div>
    </div>
  </div>

  <!-- Color scheme -->
  <div class="settings-section">
    <div class="settings-section__title">
      {{ t('settings.colorScheme.title') }}
    </div>

    <radio
      v-for="SchemeName in (['system', 'dark', 'light'] as Array<NativeTheme['themeSource']>)"
      :id="SchemeName"
      :key="SchemeName"
      :value="SchemeName"
      :checked="currentColorScheme === SchemeName"
      name="theme"
      @change="setAppColorScheme(SchemeName)"
    >
      {{ t(`settings.colorScheme.${SchemeName}`) }}
    </radio>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import Radio from '@/src/modules/ui/components/Radio.vue';
import Checkbox from '@/src/modules/ui/components/Checkbox.vue';
import { useApp } from '@/src/store/useApp';
import { useTheme } from '@/src/store/useTheme';
import { NativeTheme } from 'electron';

/**
 * Interface size limits
 */
enum InterfaceSize {
  Min = 8,
  Max = 16,
}

const { t } = useI18n();
const { state: appState } = useApp();
const { state: themeState } = useTheme();

/** Name of current color scheme */
const currentColorScheme = computed(() => themeState.name);

/** Current interface size */
const currentInterfaceSize = computed(() => appState.interfaceSize);

/** Interface settings, available for change */
const interfaceSettings = computed(() => {
  const list: (keyof typeof appState.settings)[] = [
    'isAlwaysOnTop',
    'isBlurEnabled',
  ];

  return list.map((name) => ({
    name,
    value: appState.settings[name],
  }));
});

/**
 * Toggle app setting by its name
 */
function toggleSetting (name: (keyof typeof appState.settings)): void {
  appState.settings[name] = !appState.settings[name];
}

/**
 * Set app color scheme
 */
function setAppColorScheme (value: NativeTheme['themeSource']): void {
  themeState.name = value;
}

/**
 * Set interface size
 */
function setInterfaceSize (value: number | null, event?: Event): void {
  if (!value && !event) {
    return;
  }

  let size = currentInterfaceSize.value;

  if (value) {
    size = value;
  }

  if (event) {
    size = parseInt((event.target as HTMLInputElement).value);
  }

  document.documentElement.style.setProperty('--size-base', size.toString());

  appState.interfaceSize = size;
}
</script>

<style lang="postcss">
  .settings-slider {
    --size-width: 15rem;
    --size-bar: 0.4rem;
    --size-thumb: 1.8rem;
    --size-radius: 10rem;
    --size-shadow: 0.3rem;

    margin: 0 var(--size-shadow);

    input[type=range] {
      -webkit-appearance: none;
      appearance: none;
      width: 100%;
      background: transparent;

      &::-webkit-slider-runnable-track {
        width: 100%;
        height: var(--size-bar);
        cursor: pointer;
        background-color: var(--color-control-active);
        border-radius: var(--size-radius);
      }

      &::-webkit-slider-thumb {
        -webkit-appearance: none;
        width: var(--size-thumb);
        height: var(--size-thumb);
        border-radius: 50%;
        background-color: var(--color-text);
        cursor: pointer;
        margin-top: calc(var(--size-thumb) * -0.5 + var(--size-bar) * 0.5);
        position: relative;
        z-index: 1;
      }

      &::-webkit-slider-thumb:hover {
        box-shadow: 0 0 0 var(--size-shadow) var(--color-text-tertiary);
      }
    }

    &__values {
      display: flex;
      justify-content: space-between;
      margin-top: 1rem;
    }

    &__value {
      display: flex;
      align-items: center;
      justify-content: center;
      width: var(--size-thumb);
      color: var(--color-text-secondary);
      font-size: 1.2rem;
      cursor: pointer;

      &:hover,
      &--active {
        color: var(--color-text);
      }

      &:nth-child(2n)::before {
        content: '';
        width: 1px;
        height: 0.6rem;
        background-color: var(--color-text-tertiary);
      }
    }
  }
</style>
