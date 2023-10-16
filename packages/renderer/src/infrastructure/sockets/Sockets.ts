import type SocketsInterface from '@/interfaces/Sockets.interface';

export default class Sockets implements SocketsInterface {
  private readonly socket: WebSocket;

  private readonly queue: string[] = [];

  constructor (url: string, handlers: {
    // onOpen: (event: Event) => void;
    onMessage: (event: MessageEvent<string>) => void;
  }) {
    this.socket = new WebSocket(url);

    this.socket.addEventListener('open', () => {
      this.queue.forEach((message) => {
        this.send(message);
      });
    });

    this.socket.addEventListener('message', handlers.onMessage);
  }

  public send (message: string): void {
    if (this.socket.readyState !== this.socket.OPEN) {
      this.queue.push(message);
    } else {
      this.socket.send(message);
    }
  }

  // public onOpen (): void {

  // }

  // public onMessage (): void {

  // }

  // public onClose (): void {

  // }
}
