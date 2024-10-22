import type { FunctionalComponent } from 'vue';
import Icon from './Icon';
import '../styles/checkbox.pcss';

const Checkbox: FunctionalComponent<
  {
    value: boolean;
  },
  {
    'update:value': [value: boolean];
  }
> = ({ value }, { emit, slots }) => {
  return (
    <label class="checkbox">
      <input
        hidden
        type="checkbox"
        checked={value}
        onInput={(event) =>
          emit('update:value', (event.target as HTMLInputElement).checked)
        }
      />

      <span class="checkbox__box">
        <Icon
          name="check"
          size={12}
        />
      </span>

      <span class="checkbox__label">{slots.default?.()}</span>
    </label>
  );
};

export default Checkbox;
