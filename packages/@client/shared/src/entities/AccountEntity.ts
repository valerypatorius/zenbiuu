export default interface AccountEntity {
  id: string;
  name: string;
  avatar: string;
  token: string;
  provider: string;
  tokenExpirationDate?: string;
}
