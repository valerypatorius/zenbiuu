import type { InjectionKey } from 'vue';
import type ProvidersInterface from '@/interfaces/Providers.interface';
import type AppProperties from '$/entities/AppProperties';
import type EmotesProvidersInterface from '@/interfaces/EmotesProviders.interface';

/**
 * @todo Move modules interfaces to root renderer's entities
 */
import { type ModuleLibrary } from '@/modules/library/types';
import { type ModuleAccount } from '@/modules/account/types';
import { type ModuleChat } from '@/modules/chat/types';
import { type ModuleEmotes } from '@/modules/emotes/types';

export const Injection = {
  AppProperties: Symbol('app properties') as InjectionKey<AppProperties>,
  Providers: Symbol('providers') as InjectionKey<ProvidersInterface>,
  EmotesProviders: Symbol('emotes providers') as InjectionKey<EmotesProvidersInterface>,
  Module: {
    Account: Symbol('account module') as InjectionKey<ModuleAccount>,
    Library: Symbol('library module') as InjectionKey<ModuleLibrary>,
    Chat: Symbol('chat module') as InjectionKey<ModuleChat>,
    Emotes: Symbol('emotes module') as InjectionKey<ModuleEmotes>,
  },
} as const;
