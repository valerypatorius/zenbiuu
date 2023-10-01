import type { InjectionKey } from 'vue';
import type Account from '@/modules/account';
import type Auth from '@/modules/auth';
import type ProvidersInterface from '@/interfaces/Providers.interface';
import type HubInterface from '@/interfaces/Hub.interface';
import type AppProperties from '$/entities/AppProperties';

export const Injection = {
  AppProperties: Symbol('app properties') as InjectionKey<AppProperties>,
  Providers: Symbol('providers') as InjectionKey<ProvidersInterface>,
  Module: {
    Hub: Symbol('hub') as InjectionKey<HubInterface>,
    Auth: Symbol('auth module') as InjectionKey<Auth>,
    Account: Symbol('account module') as InjectionKey<Account>,
  },
} as const;
