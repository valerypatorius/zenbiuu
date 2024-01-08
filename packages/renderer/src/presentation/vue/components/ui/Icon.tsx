import { type FunctionalComponent } from 'vue';
import icons from '@/assets/icons';
import '../styles/icon.pcss';

const Icon: FunctionalComponent<{
  name?: keyof typeof icons;
  raw?: string;
  size?: number;
}> = (props) => {
  const svg = props.name !== undefined ? icons[props.name] : (props.raw ?? '');

  return <div
    class="icon"
    style={{
      '--size': `${props.size}px`,
    }}
    v-html={svg}
  />;
};

export default Icon;
