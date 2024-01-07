import Transport from '@/transport/Transport';

export default abstract class AbstractProvider {
  protected readonly transport = new Transport({});
}
