import { IntervalAction, type IntervalWorkerMessage } from './types';

const intervalsIds = new Map<string, ReturnType<typeof setInterval>>();

function start (id: string, frequency: number, isImmediate = false): void {
  const intervalId = setInterval(() => {
    self.postMessage(id);
  }, frequency);

  if (isImmediate) {
    self.postMessage(id);
  }

  intervalsIds.set(id, intervalId);
}

function stop (id: string): void {
  const intervalId = intervalsIds.get(id);

  if (intervalId === undefined) {
    return;
  }

  clearInterval(intervalId);

  intervalsIds.delete(id);
}

self.onmessage = ({ data: messageData }: IntervalWorkerMessage) => {
  const { id, frequency, isImmediate } = messageData.data;

  switch (messageData.action) {
    case IntervalAction.Start:
      start(id, frequency, isImmediate);
      break;

    case IntervalAction.Stop:
      stop(id);
      break;
  }
};
