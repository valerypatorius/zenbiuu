import { type AuthorizedEntity } from '@/entities/AuthorizedEntity';
import ObservableStore from '@/modules/shared/store/ObservableStore';

interface AuthStoreSchema {
  entities: AuthorizedEntity[];
  primary?: AuthorizedEntity;
}

export default class AuthStore extends ObservableStore<AuthStoreSchema> {
  constructor () {
    super('store:auth', {
      entities: [],
    });
  }

  public saveEntity (value: AuthorizedEntity): void {
    this.stateProxy.entities.push(value);
  }

  public removeEntity ({ provider, token }: AuthorizedEntity): void {
    const entityIndex = this.stateProxy.entities.findIndex((entity) => entity.provider === provider && entity.token === token);

    if (entityIndex >= 0) {
      this.stateProxy.entities.splice(entityIndex, 1);
    }

    const isPrimaryEntity = this.stateProxy.primary?.provider === provider && this.stateProxy.primary.token === token;

    if (!isPrimaryEntity) {
      return;
    }

    if (this.stateProxy.entities.length === 0) {
      this.stateProxy.primary = undefined;
    }

    this.stateProxy.primary = Object.assign({}, this.stateProxy.entities[0]);
  }

  public setPrimaryEntity (value: AuthorizedEntity): void {
    this.stateProxy.primary = value;
  }
}
