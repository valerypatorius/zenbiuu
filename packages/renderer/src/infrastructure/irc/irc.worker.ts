import { IrcAction, IrcWorkerMessage, IrcPayload } from './types.irc.worker';

const context = self as any as Worker;

/**
 * Messages queue
 */
const queue = new Set<string>();

/**
 * Socket instance
 */
let socket: WebSocket | undefined;

/**
 * Connection url and credentials
 */
const connectionOptions: Record<string, string | undefined> = {
  /** IRC url */
  url: undefined,

  /** User authorization token */
  token: undefined,

  /** User name */
  name: undefined,
};

/**
 * Send user credentials in order to connect to IRC
 */
function handleAuth (): void {
  if (
    socket === undefined ||
    Object.values(connectionOptions).some((value) => value === undefined)
  ) {
    return;
  }

  socket.send(`PASS oauth:${connectionOptions.token as string}`);
  socket.send(`NICK ${connectionOptions.name as string}`);
  socket.send('CAP REQ :twitch.tv/tags');
}

/**
 * Handle incoming message and transfer it to global environment
 * @param event - message event
 */
function handleMessage (event: MessageEvent<string>): void {
  if (socket === undefined) {
    return;
  }

  if (event.data.trim() === 'PING :tmi.twitch.tv') {
    socket.send('PONG :tmi.twitch.tv');

    return;
  }

  context.postMessage(event.data);
}

/**
 * Tell global environment that socket connection was closed
 * @param event - close event
 */
function handleClose (event: CloseEvent): void {
  context.postMessage({
    close: true,
    code: event.code,
  });
}

/**
 * Send message and remove it from queue
 * @param message - queued message
 */
function handleQueuedMessage (message: string): void {
  if (socket === undefined) {
    return;
  }

  socket.send(message);
  queue.delete(message);
}

/**
 * Connect to IRC
 * @param payload - payload, needed for successfull connection
 */
function connect ({ url, token, name }: IrcPayload): void {
  if (socket !== undefined) {
    return;
  }

  connectionOptions.url = url;
  connectionOptions.token = token;
  connectionOptions.name = name;

  if (Object.values(connectionOptions).some((value) => value === undefined)) {
    return;
  }

  socket = new WebSocket(connectionOptions.url as string);

  socket.addEventListener('open', handleAuth);
  socket.addEventListener('message', handleMessage);
  socket.addEventListener('close', handleClose);
}

/**
 * Close socket connection
 */
function disconnect (code?: number): void {
  if (socket === undefined) {
    return;
  }

  socket.close(code);

  socket.removeEventListener('open', handleAuth);
  socket.removeEventListener('message', handleMessage);
  socket.removeEventListener('close', handleClose);

  socket = undefined;
}

/**
 * If socket is open, send message to join chat.
 * Otherwise put message in queue
 */
function joinChannelChat (channel?: string): void {
  if (channel === undefined) {
    return;
  }

  const message = `JOIN #${channel}`;

  if (socket === undefined || socket.readyState !== socket.OPEN) {
    queue.add(message);

    return;
  }

  socket.send(message);
}

/**
 * If socket is open, send message to leave chat.
 * Otherwise put message in queue
 */
function leaveChannelChat (channel?: string): void {
  if (socket === undefined || channel === undefined) {
    return;
  }

  const message = `PART #${channel}`;

  if (socket.readyState !== socket.OPEN) {
    queue.add(message);

    return;
  }

  socket.send(`PART #${channel}`);
}

/**
 * If socket is open, send messages and remove them from queue
 */
function resolveQueue (): void {
  if (socket === undefined || socket.readyState !== socket.OPEN) {
    return;
  }

  queue.forEach(handleQueuedMessage);
}

context.onmessage = ({ data: messageData }: IrcWorkerMessage) => {
  const payload = messageData.data;

  switch (messageData.action) {
    case IrcAction.Connect:
      connect(payload);
      break;
    case IrcAction.Disconnect:
      disconnect(payload.code);
      break;
    case IrcAction.Join:
      joinChannelChat(payload.channel);
      break;
    case IrcAction.Leave:
      leaveChannelChat(payload.channel);
      break;
    case IrcAction.RunQueue:
      resolveQueue();
      break;
  }
};
