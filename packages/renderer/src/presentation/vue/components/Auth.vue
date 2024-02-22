<template>
  <div class="auth">
    <Scrollable>
      <div class="auth__content">
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
            <Button
              v-for="provider in availableProviders"
              :key="provider.name"
              @click="login(provider.name)"
            >
              {{ provider.displayName }}
            </Button>
          </div>

          <div class="auth__disclaimer">
            {{ t('auth.disclaimer') }}
          </div>
        </div>
      </div>
    </Scrollable>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useProviders } from '../services/useProviders';
import Scrollable from './ui/Scrollable.vue';
import Button from '@/presentation/vue/components/ui/Button';
import appIconPath from '@/assets/icon.svg';
import { useAccount } from '@/presentation/vue/services/useAccount';

const { t } = useI18n();
const { login } = useAccount();
const { available: availableProviders } = useProviders();
</script>

<style lang="postcss">
@import '@/presentation/styles/typography.pcss';

.auth {
  display: grid;
  padding-top: var(--layout-titlebar-height);

  &__content {
    margin: auto;
    min-height: 100%;
    display: grid;
    grid-template-columns: 260px 1fr;
    align-items: center;
    gap: 30px;
    max-width: 680px;
  }

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
