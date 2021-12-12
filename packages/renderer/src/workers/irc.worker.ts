const context = self as any as Worker;

/**
 * Socket instance
 */
let socket: WebSocket | null = null;

/**
 * Messages queue
 */
let queue: string[] = [];

/**
 * Connect to Twitch IRC
 */
function connect ({ url, token, name }: WorkerMessageData['data']): void {
  if (socket !== null) {
    return;
  }

  socket = new WebSocket(url);

  socket.addEventListener('open', function auth () {
    this.send(`PASS oauth:${token}`);
    this.send(`NICK ${name}`);
    this.send('CAP REQ :twitch.tv/tags :twitch.tv/commands');
    // this.send('CAP REQ :twitch.tv/membership :twitch.tv/tags :twitch.tv/commands');
    // this.send(`USER ${name} 8 * :${name}`);
  });

  socket.addEventListener('message', function process (event) {
    if (event.data.trim() === 'PING :tmi.twitch.tv') {
      this.send('PONG :tmi.twitch.tv');
    } else {
      context.postMessage(event.data);
    }
  });

  socket.addEventListener('close', (event) => {
    socket = null;

    context.postMessage({
      close: true,
      code: event.code,
    });
  });
}

/**
 * Close socket connection
 */
function disconnect (code: number | undefined): void {
  if (socket === null) {
    return;
  }

  socket.close(code);
}

/**
 * If socket is connected, send message to join Twitch chat.
 * Otherwise put message in queue
 */
function joinChannelChat (channel: string): void {
  const message = `JOIN #${channel}`;

  if ((socket !== null) && socket.readyState === 1) {
    socket.send(message);
    return;
  }

  queue.push(message);
}

/**
 * If socket is connected, send message to leave Twitch chat.
 * Otherwise put message in queue
 */
function leaveChannelChat (channel: string): void {
  const message = `PART #${channel}`;

  if ((socket !== null) && socket.readyState === 1) {
    socket.send(message);
    return;
  }

  queue.push(message);
}

/**
 * If socket is connected, send message text to Twitch chat.
 * Otherwise put message in queue
 */
function postMessageToChat ({ channel, text, nonce }: WorkerMessageData['data']): void {
  const message = `@client-nonce=${nonce} PRIVMSG #${channel} :${text}`;

  if ((socket !== null) && socket.readyState === 1) {
    socket.send(message);
    return;
  }

  queue.push(message);
}

/**
 * Send messages from queue, if socket is ready
 */
function resolveQueue (): void {
  if ((socket == null) || socket.readyState !== 1) {
    return;
  }

  queue.forEach((message) => {
    if (socket != null) {
      socket.send(message);
    }
  });

  queue = [];
}

onmessage = ({ data }: MessageEvent<WorkerMessageData>) => {
  switch (data.action) {
    case 'connect':
      connect(data.data);
      break;
    case 'disconnect':
      disconnect(data.data.code);
      break;
    case 'join':
      joinChannelChat(data.data.channel);
      break;
    case 'leave':
      leaveChannelChat(data.data.channel);
      break;
    case 'message':
      postMessageToChat(data.data);
      break;
    case 'runQueue':
      resolveQueue();
      break;
    default:
  }
};

export default {};
