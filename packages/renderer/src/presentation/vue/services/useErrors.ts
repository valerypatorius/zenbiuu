import { reactive } from 'vue';
import { createSharedComposable } from '@vueuse/core';

interface InterfaceError {
  error: Error;
  date: Date;
}

export const useErrors = createSharedComposable(() => {
  const limit = 3;
  const errors = reactive(new Set<InterfaceError>());

  async function catchable (fn: (...args: any[]) => Promise<any>): Promise<any> {
    try {
      return await fn();
    } catch (error) {
      if (error instanceof Error) {
        if (errors.size >= limit) {
          errors.delete(errors.values().next().value);
        }

        errors.add({
          error,
          date: new Date(),
        });
      }

      console.error(error);
    }
  }

  function remove (error: InterfaceError): void {
    errors.delete(error);
  }

  return {
    errors,
    catchable,
    remove,
  };
});
