import Transport from '@/transport/Transport';

export default abstract class AbstractEmotesProvider {
  protected readonly transport = new Transport({});
}
