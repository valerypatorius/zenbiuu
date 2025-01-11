<template>
  <aside class="sidebar">
    <div class="sidebar__search">
      <TextInput
        icon="search"
        :placeholder="t('search')"
        @update:value="(value) => {
          searchQuery = value;
        }"
      />
    </div>

    <Scrollable>
      <div class="sidebar__channels">
        <SidebarItem
          v-for="channel in channels.filter((channel) => channel.name.toLowerCase().includes(searchQuery.toLowerCase()))"
          :key="channel.name"
          v-bind="channel"
          :openedIndex="openedChannels.findIndex((openedChannel) => openedChannel.name === channel.name)"
          :isCompactLayout="isCompactLayout"
          :isActionsAvailable="!channel.isOpened && openedChannels.length > 0"
          @select="(name) => openChannel(name)"
          @add="(name) => openChannel(name, true)"
          @close="(name) => closeChannel(name)"
        />
      </div>
    </Scrollable>
  </aside>
</template>

<script setup lang="ts">
import { useLibrary } from '~/services/useLibrary';
import Scrollable from './ui/Scrollable.vue';
import TextInput from './ui/TextInput';
import { useSettings } from '~/services/useSettings';
import SidebarItem from './SidebarItem';
import { useI18n } from 'vue-i18n';

const { channels, openedChannels, searchQuery, openChannel, closeChannel } = useLibrary();
const { isCompactLayout } = useSettings();
const { t } = useI18n();
</script>

<style lang="postcss">
@import '~/styles/typography.pcss';

.sidebar {
  display: grid;
  grid-template-rows: auto 1fr;
  background-color: var(--theme-color-background-sidebar);
  padding-top: calc(var(--layout-titlebar-height) + 6px);

  &__search {
    height: 46px;
    padding: 0 6px 6px;
    background-color: var(--theme-color-background-sidebar);
    display: flex;

    .text-input {
      border-radius: 12px;
    }
  }

  &__channels {
    padding: 0 6px 6px 6px;
  }
}
</style>
