import AccountStore from './store';
import AccountService from './service';
import providers from '@/providers/index';

class Account {
  public readonly store = new AccountStore();
  public readonly service = new AccountService(this.store, providers);
}

const account = new Account();

export default account;
