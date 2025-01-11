import type { FunctionalComponent, InputHTMLAttributes } from 'vue';
import type icons from '~/assets/icons';
import '../styles/text-input.pcss';
import Icon from './Icon';

const TextInput: FunctionalComponent<
  {
    placeholder?: string;
    icon?: keyof typeof icons;
  },
  {
    'update:value': [value: string];
    submit: [value: string];
  }
> = ({ placeholder, icon }, { emit }) => {
  return (
    <div class="text-input">
      {icon && (
        <div class="text-input__icon">
          <Icon
            name={icon}
            size={18}
          />
        </div>
      )}

      <input
        type="text"
        placeholder={placeholder}
        onInput={(event) => {
          event.preventDefault();
          emit('update:value', (event.target as HTMLInputElement).value);
        }}
        onKeyup={(event) => {
          switch (event.key) {
            case 'Enter':
              emit('submit', (event.target as HTMLInputElement).value);
              break;
            case 'Escape':
              (event.target as HTMLInputElement).blur();
              (event.target as HTMLInputElement).value = '';
              emit('update:value', '');
              break;
          }
        }}
      />
    </div>
  );
};

export default TextInput;
