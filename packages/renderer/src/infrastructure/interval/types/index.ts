export interface IntervalData {
  id: string;
  frequency: number;
  isImmediate?: boolean;
}

export type IntervalHandler = (...args: any) => (void | Promise<void>);

export enum IntervalAction {
  Start = 'start',
  Stop = 'stop',
}

export type IntervalWorkerMessage = MessageEvent<{ action: IntervalAction; data: IntervalData }>;
