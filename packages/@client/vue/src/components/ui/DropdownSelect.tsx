import { type FunctionalComponent } from 'vue';
import Icon from './Icon';
import '../styles/select.pcss';

const DropdownSelect: FunctionalComponent<{
  modelValue: string;
  options: { value: string; label: string }[];
}> = ({ modelValue, options }, { emit }) => {
  return (
    <div class="select">
      <div
        class="select__value"
        tabindex={0}
      >
        {options.find((option) => option.value === modelValue)?.label}

        <Icon
          name="chevronDown"
          size={16}
        />
      </div>

      <div class="select__options">
        {options
          .sort((optionA, optionB) => (optionB.value === modelValue ? 1 : 0) - (optionA.value === modelValue ? 1 : 0))
          .map((option) => (
            <div
              class={[
                'select__option',
                option.value === modelValue && 'select__option--active',
              ]}
              onMousedown={() => emit('update:modelValue', option.value)}
            >
              {option.label}

              {option.value === modelValue && (
                <Icon
                  name="check"
                  size={16}
                />
              )}
            </div>
          ))}
      </div>
    </div>
  );
};

export default DropdownSelect;
