import AuthStore from './store';
import AuthService from './service';
import hub from '@/modules/hub';
import providers from '@/providers/index';

class Auth {
  public readonly store = new AuthStore();
  public readonly service = new AuthService(this.store, hub.service, providers);
}

const auth = new Auth();

export default auth;
