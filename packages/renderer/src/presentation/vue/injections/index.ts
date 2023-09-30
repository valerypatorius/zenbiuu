import type { InjectionKey } from 'vue';
import type Account from '@/modules/account';
import type Auth from '@/modules/auth';
import type ProvidersInterface from '@/interfaces/Providers.interface';
import type HubInterface from '@/interfaces/Hub.interface';
import type AppProperties from '$/entities/AppProperties';

export const appPropertiesKey = Symbol('app properties') as InjectionKey<AppProperties>;

export const hubKey = Symbol('hub') as InjectionKey<HubInterface>;

export const providersKey = Symbol('providers') as InjectionKey<ProvidersInterface>;

/**
 * @todo Deal with importing from modules folder...
 */

export const authModuleKey = Symbol('auth module') as InjectionKey<Auth>;

export const accountModuleKey = Symbol('account module') as InjectionKey<Account>;
