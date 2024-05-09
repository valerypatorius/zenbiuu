import { type AppProperties } from '@zenbiuu/shared';
import type { InjectionKey } from 'vue';
import type { ProvidersInterface, EmotesProvidersInterface } from '@client/shared';

/**
 * @todo Use public interfaces instead
 */
import { createAccount, createChat, createEmotes, createLibrary } from '@client/core';

export const Injection = {
  AppProperties: Symbol('app properties') as InjectionKey<AppProperties>,
  Providers: Symbol('providers') as InjectionKey<ProvidersInterface>,
  EmotesProviders: Symbol('emotes providers') as InjectionKey<EmotesProvidersInterface>,
  Module: {
    Account: Symbol('account module') as InjectionKey<Awaited<ReturnType<typeof createAccount>>>,
    Library: Symbol('library module') as InjectionKey<Awaited<ReturnType<typeof createLibrary>>>,
    Chat: Symbol('chat module') as InjectionKey<Awaited<ReturnType<typeof createChat>>>,
    Emotes: Symbol('emotes module') as InjectionKey<Awaited<ReturnType<typeof createEmotes>>>,
  },
} as const;
