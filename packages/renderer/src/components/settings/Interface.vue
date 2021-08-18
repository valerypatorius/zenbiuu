<template>
  <!-- Interface settings -->
  <div class="settings-section">
    <div class="settings-section__title">
      {{ $t('settings.interface.general') }}
    </div>

    <checkbox
      v-for="setting in interfaceSettings"
      :key="setting.name"
      :value="setting.value"
      @change="toggleSetting(setting.name)"
    >
      {{ $t(`settings.interface.${setting.name}`) }}
    </checkbox>
  </div>

  <!-- Interface size -->
  <div class="settings-section">
    <div class="settings-section__title">
      {{ $t('settings.interface.size') }}
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
      {{ $t('settings.colorScheme.title') }}
    </div>

    <radio
      v-for="SchemeName in AppColorScheme"
      :id="SchemeName"
      :key="SchemeName"
      :value="SchemeName"
      :checked="currentColorScheme === SchemeName"
      name="theme"
      @change="setAppColorScheme(SchemeName)"
    >
      {{ $t(`settings.colorScheme.${SchemeName}`) }}
    </radio>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import Radio from '@/src/components/ui/Radio.vue';
import Checkbox from '@/src/components/ui/Checkbox.vue';
import { TOGGLE_APP_SETTING, SET_APP_COLOR_SCHEME, SET_APP_INTERFACE_SIZE } from '@/src/store/actions';
import { AppColorScheme } from '@/types/color';
import type { AppSettings } from '@/types/schema';

/**
 * Interface size limits
 */
enum InterfaceSize {
  Min = 8,
  Max = 16,
}

export default defineComponent({
  name: 'SettingsInterface',
  components: {
    Radio,
    Checkbox,
  },
  data (): {
    AppColorScheme: typeof AppColorScheme;
    InterfaceSize: typeof InterfaceSize;
    } {
    return {
      /**
       * Available app color schemes
       */
      AppColorScheme,

      /**
       * Interface size limits
       */
      InterfaceSize,
    };
  },
  computed: {
    /**
     * Name of current color scheme
     */
    currentColorScheme (): AppColorScheme {
      return this.$store.state.theme.name;
    },

    /**
     * Current interface size
     */
    currentInterfaceSize (): number {
      return this.$store.state.app.interfaceSize;
    },

    /**
     * Interface settings, available for change
     */
    interfaceSettings (): {
      name: keyof AppSettings;
      value: boolean;
    }[] {
      const list: (keyof AppSettings)[] = [
        'isAlwaysOnTop',
        'isBlurEnabled',
      ];

      return list.map((name) => ({
        name,
        value: this.$store.state.app.settings[name],
      }));
    },
  },
  methods: {
    /**
     * Toggle app setting by its name
     */
    toggleSetting (name: keyof AppSettings): void {
      this.$store.dispatch(TOGGLE_APP_SETTING, name);
    },

    /**
     * Set app color scheme
     */
    setAppColorScheme (value: AppColorScheme): void {
      this.$store.dispatch(SET_APP_COLOR_SCHEME, value);
    },

    /**
     * Set interface size
     */
    setInterfaceSize (value: number | null, event?: Event): void {
      if (!value && !event) {
        return;
      }

      let size = this.currentInterfaceSize;

      if (value) {
        size = value;
      }

      if (event) {
        size = parseInt((event.target as HTMLInputElement).value);
      }

      document.documentElement.style.setProperty('--size-base', size.toString());

      this.$store.dispatch(SET_APP_INTERFACE_SIZE, size);
    },
  },
});
</script>

<style>
  .settings-slider {
    --size-width: 15rem;
    --size-bar: 0.4rem;
    --size-thumb: 1.8rem;
    --size-radius: 10rem;
    --size-shadow: 0.3rem;

    margin: 0 var(--size-shadow);
  }

  .settings-slider input[type=range] {
    -webkit-appearance: none;
    width: 100%;
    background: transparent;
  }

  .settings-slider input[type=range]::-webkit-slider-runnable-track {
    width: 100%;
    height: var(--size-bar);
    cursor: pointer;
    background-color: var(--color-control-active);
    border-radius: var(--size-radius);
  }

  .settings-slider input[type=range]::-webkit-slider-thumb {
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

  .settings-slider input[type=range]::-webkit-slider-thumb:hover {
    box-shadow: 0 0 0 var(--size-shadow) var(--color-text-tertiary);
  }

  .settings-slider__values {
    display: flex;
    justify-content: space-between;
    margin-top: 1rem;
  }

  .settings-slider__value {
    display: flex;
    align-items: center;
    justify-content: center;
    width: var(--size-thumb);
    color: var(--color-text-secondary);
    font-size: 1.2rem;
    cursor: pointer;
  }

  .settings-slider__value:hover,
  .settings-slider__value--active {
    color: var(--color-text);
  }

  .settings-slider__value:nth-child(2n)::before {
    content: '';
    width: 1px;
    height: 0.6rem;
    background-color: var(--color-text-tertiary);
  }
</style>
