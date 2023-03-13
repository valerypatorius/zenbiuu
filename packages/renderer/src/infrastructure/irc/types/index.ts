export interface IrcPayload {
  url?: string;
  channel?: string;
  token?: string;
  name?: string;
  code?: IrcCloseCode;
}

export type IrcData = {
  code?: IrcCloseCode;
  close?: boolean;
} | string;

export enum IrcCloseCode {
  Manual = 3000,
  Default = 1005,
  Abnormal = 1006,
};

export enum IrcCommand {
  Connect = '001',
  Disconnect = '-1',
  Join = 'JOIN',
  Leave = 'PART',
  Message = 'PRIVMSG',
}

export enum IrcAction {
  Connect = 'connect',
  Disconnect = 'disconnect',
  Join = 'join',
  Leave = 'leave',
  RunQueue = 'runQueue',
}

export type IrcWorkerMessage = MessageEvent<{ action: IrcAction; data: IrcPayload }>;
