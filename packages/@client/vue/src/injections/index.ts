import type {
  EmotesProvidersInterface,
  ProvidersInterface,
} from '@client/shared';
import type { AppProperties } from '@zenbiuu/shared';
import type { InjectionKey } from 'vue';

/**
 * @todo Use public interfaces instead
 */
import type {
  createAccount,
  createChat,
  createEmotes,
  createLibrary,
  createSettings,
} from '@client/core';

export const Injection = {
  AppProperties: Symbol('app properties') as InjectionKey<AppProperties>,
  Providers: Symbol('providers') as InjectionKey<ProvidersInterface>,
  EmotesProviders: Symbol(
    'emotes providers',
  ) as InjectionKey<EmotesProvidersInterface>,
  Module: {
    Account: Symbol('account module') as InjectionKey<
      Awaited<ReturnType<typeof createAccount>>
    >,
    Library: Symbol('library module') as InjectionKey<
      Awaited<ReturnType<typeof createLibrary>>
    >,
    Chat: Symbol('chat module') as InjectionKey<
      Awaited<ReturnType<typeof createChat>>
    >,
    Emotes: Symbol('emotes module') as InjectionKey<
      Awaited<ReturnType<typeof createEmotes>>
    >,
    Settings: Symbol('settings module') as InjectionKey<
      Awaited<ReturnType<typeof createSettings>>
    >,
  },
} as const;
