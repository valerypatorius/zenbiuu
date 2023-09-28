<template>
  <div class="auth">
    <img
      class="auth__logo"
      :src="appIconPath"
    >

    <div class="auth__main">
      <div class="auth__title">
        {{ t('auth.title') }}
      </div>

      {{ t('auth.description') }}

      <div class="auth__buttons">
        <Button @click="authorize(Provider.Twitch)">
          Twitch
        </Button>

        <Button @click="authorize(Provider.Goodgame)">
          GoodGame
        </Button>
      </div>

      <div class="auth__disclaimer">
        {{ t('auth.disclaimer') }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useAuth } from '@/presentation/vue/services/useAuth';
import Button from '@/presentation/vue/components/ui/Button.vue';
import appIconPath from '@/assets/icon.svg';
import { Provider } from '@/providers/types';

const { t } = useI18n();
const { authorize } = useAuth();
</script>

<style lang="postcss">
@import '@/presentation/styles/typography.pcss';

.auth {
  display: grid;
  grid-template-columns: 260px 1fr;
  align-items: center;
  gap: 30px;
  max-width: 680px;

  &__logo {
    width: 100%;
  }

  &__main {
    display: grid;
    gap: 20px;
  }

  &__title {
    @extend %text-heading;
  }

  &__buttons {
    display: flex;
    gap: 12px;
  }

  &__disclaimer {
    @extend %text-small;
    color: var(--theme-color-text-secondary);
  }
}
</style>
@/providers/types/types
