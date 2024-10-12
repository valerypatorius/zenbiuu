import type { FunctionalComponent } from 'vue';

const PrettyNumber: FunctionalComponent<{
  value: number;
}> = ({ value }) => {
  /**
   * @todo Get app locale and update accordingly
   */
  return value.toLocaleString();
};

export default PrettyNumber;
