/* eslint-disable */
import { ComponentCustomProperties } from 'vue';
import { Store } from 'vuex';
import { RootState, RootSchema, ModulesSchema } from '../schema';

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $store: Store<RootSchema & ModulesSchema>
  }
}