import type { IntervalManagerItem } from '@/src/utils/interval';

const context = self as any as Worker;

/**
 * List of active interval ids
 */
const list: Array<ReturnType<typeof setInterval>> = [];

/**
 * Start interval and push id to list
 */
function start (initialData: IntervalManagerItem): void {
  const intervalId = setInterval(() => {
    context.postMessage(initialData);
  }, initialData.frequency);

  context.postMessage({
    ...initialData,
    intervalId,
  });

  list.push(intervalId);
}

/**
 * Stop active interval by its id
 */
function stop (id: ReturnType<typeof setInterval>): void {
  clearInterval(id);

  const index = list.indexOf(id);

  if (index > -1) {
    list.splice(index, 1);
  }
}

context.onmessage = ({ data }: MessageEvent<WorkerMessageData>) => {
  const { initialData, intervalId }: any = data.data;

  switch (data.action) {
    case 'start':
      start(initialData);
      break;

    case 'stop':
      stop(intervalId);
      break;

    default:
  }
};
