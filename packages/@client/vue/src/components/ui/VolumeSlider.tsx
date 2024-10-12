import type { FunctionalComponent } from 'vue';
import '../styles/volume-slider.pcss';

const VolumeSlider: FunctionalComponent<
  {
    modelValue: number;
  },
  {
    'update:modelValue': [value: number];
  }
> = (props, { emit }) => {
  return (
    <input
      class="volume-slider"
      type="range"
      min="0"
      max="1"
      step="0.01"
      value={props.modelValue}
      onInput={(event) => {
        emit(
          'update:modelValue',
          Number.parseFloat((event.target as HTMLInputElement).value),
        );
      }}
    />
  );
};

export default VolumeSlider;
