import type { ChannelEntity, LiveStream } from '@client/shared';
import { withModifiers, type FunctionalComponent } from 'vue';
import ChannelCard from './ChannelCard.vue';
import Icon from './ui/Icon';
import './styles/sidebar-item.pcss';

const SidebarItem: FunctionalComponent<
  {
    name: string;
    data?: ChannelEntity;
    stream?: LiveStream;
    openedIndex: number;
    isLive: boolean;
    isOpened: boolean;
    isCompactLayout: boolean;
    isActionsAvailable: boolean;
  },
  {
    select: [name: string];
    add: [name: string];
    close: [name: string];
  }
> = ({ name, data, stream, openedIndex, isLive, isOpened, isCompactLayout, isActionsAvailable }, { emit }) => {
  return (
    <div
      class={['sidebar-item', isOpened && 'sidebar-item--active', isCompactLayout && 'sidebar-item--compact']}
      style={{
        '--opened-channel-index': openedIndex,
      }}
      onClick={() => emit('select', name)}
    >
      <div class="sidebar-item__main">
        <ChannelCard
          name={name}
          details={stream?.category ?? (!isCompactLayout ? 'Offline' : undefined)}
          avatar={data?.avatar}
          isLive={isLive}
        />
      </div>

      {isOpened && (
        <div
          class="sidebar-item__action"
          onClick={withModifiers(() => emit('close', name), ['stop'])}
        >
          <Icon
            name="close"
            size={15}
          />
        </div>
      )}

      {isActionsAvailable && (
        <div
          class="sidebar-item__action"
          onClick={withModifiers(() => emit('add', name), ['stop'])}
        >
          <Icon
            name="playlistAdd"
            size={20}
          />
        </div>
      )}
    </div>
  );
};

export default SidebarItem;
