import Worker from '@/src/workers/interval.worker.ts?worker';
import { uid } from '@/src/utils/utils';

export interface IntervalManagerItem {
  intervalId?: ReturnType<typeof setInterval>;
  managerId: string;
  frequency: number;
  isImmediate: boolean;
  onupdate?: () => void;
};

/**
 * Helps to communicate with web worker
 */
class IntervalManager {
  worker: Worker;
  list: {[key: string]: IntervalManagerItem};

  constructor () {
    this.worker = new Worker();
    this.worker.onmessage = this.onWorkerMessage.bind(this);

    this.list = {};
  }

  /**
   * Terminate running worker
   */
  disconnect (): void {
    this.worker.terminate();
  }

  /**
   * Start interval
   */
  start (frequency: number, isImmediate = true): IntervalManagerItem {
    const managerId = uid();
    const initialData: IntervalManagerItem = {
      managerId,
      frequency,
      isImmediate,
    };

    this.list[managerId] = initialData;

    this.worker.postMessage({
      action: 'start',
      data: {
        initialData,
      },
    });

    return this.list[managerId];
  }

  /**
   * Stop interval
   */
  stop (interval: IntervalManagerItem): void {
    const { intervalId, managerId } = interval;

    this.worker.postMessage({
      action: 'stop',
      data: {
        intervalId,
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    delete this.list[managerId];
  }

  /**
   * Handle worker messages
   */
  onWorkerMessage (event: MessageEvent): void {
    const { intervalId, managerId } = event.data;
    const interval = this.list[managerId];

    if (!interval) {
      return;
    }

    if (intervalId) {
      interval.intervalId = intervalId;

      if (!interval.isImmediate) {
        return;
      }
    }

    if (interval.onupdate != null) {
      interval.onupdate();
    }
  }
}

const interval = new IntervalManager();

export default interval;
