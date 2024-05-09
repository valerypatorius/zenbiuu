import type { TransportInterface } from '.';

export abstract class AbstractEmotesProvider {
  public static readonly name: string;

  protected abstract readonly transport: TransportInterface;
}
