export interface IrcPayload {
  url?: string;
  channel?: string;
  token?: string;
  name?: string;
  code?: IrcCloseCode;
  message?: string;
  nonce?: string;
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
  Clear = 'CLEARCHAT',
  Notice = 'NOTICE',
  HostTarget = 'HOSTTARGET',

  Join = 'JOIN',
  Leave = 'PART',

  Message = 'PRIVMSG',

  GlobalUserState = 'GLOBALUSERSTATE',
  UserState = 'USERSTATE',
  RoomState = 'ROOMSTATE',
}

export enum IrcAction {
  Connect = 'connect',
  Disconnect = 'disconnect',
  Join = 'join',
  Leave = 'leave',
  RunQueue = 'runQueue',
  Send = 'send',
}

export interface ParsedIrcMessage {
  command: IrcCommand;
  channel?: string;
  text?: string;
  tags?: Record<string, any>;
}

export type IrcWorkerMessage = MessageEvent<{ action: IrcAction; data: IrcPayload }>;
