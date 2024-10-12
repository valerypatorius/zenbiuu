import type { FunctionalComponent } from 'vue';
import '../styles/button.pcss';

const Button: FunctionalComponent<{
  type?: 'secondary';
}> = (props, { slots }) => {
  return (
    <button
      class={['button', props.type !== undefined && `button--${props.type}`]}
      type="button"
    >
      {slots.default?.()}
    </button>
  );
};

export default Button;
