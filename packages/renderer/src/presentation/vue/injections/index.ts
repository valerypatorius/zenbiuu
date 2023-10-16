import type { InjectionKey } from 'vue';
import type Account from '@/modules/account';
import type ProvidersInterface from '@/interfaces/Providers.interface';
import type AppProperties from '$/entities/AppProperties';
import type Library from '@/modules/library';
import type Chat from '@/modules/chat';

export const Injection = {
  AppProperties: Symbol('app properties') as InjectionKey<AppProperties>,
  Providers: Symbol('providers') as InjectionKey<ProvidersInterface>,
  Module: {
    Account: Symbol('account module') as InjectionKey<Account>,
    Library: Symbol('library module') as InjectionKey<Library>,
    Chat: Symbol('chat module') as InjectionKey<Chat>,
  },
} as const;
