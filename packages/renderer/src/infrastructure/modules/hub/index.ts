import HubService from './service';

class Hub {
  public readonly service = new HubService();
}

const hub = new Hub();

export default hub;
