import { type IntervalPayload } from '../types';

const intervalsByKey = new Map<string, ReturnType<typeof setInterval>>();

function start({ key, delay = 0, immediate = false }: IntervalPayload): void {
  if (immediate) {
    self.postMessage(key);
  }

  const interval = setInterval(() => {
    self.postMessage(key);
  }, delay);

  intervalsByKey.set(key, interval);
}

function stop(key: string): void {
  const interval = intervalsByKey.get(key);

  if (interval === undefined) {
    return;
  }

  clearInterval(interval);

  intervalsByKey.delete(key);
}

self.onmessage = ({ data: messageData }: MessageEvent<{ action: 'start' | 'stop'; data: IntervalPayload }>) => {
  switch (messageData.action) {
    case 'start':
      start(messageData.data);
      break;
    case 'stop':
      stop(messageData.data.key);
      break;
  }
};
