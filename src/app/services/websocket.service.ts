import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private socket: WebSocket;
  private messagesSubject = new BehaviorSubject<any[]>([]);
  public messages$ = this.messagesSubject.asObservable();

  constructor() {
    this.socket = new WebSocket('ws://localhost:3000'); // Replace with your server URL

    this.socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      this.messagesSubject.next([message, ...this.messagesSubject.value]);
    };

    this.socket.onopen = () => {
      console.log('WebSocket connection established');
    };

    this.socket.onclose = () => {
      console.log('WebSocket connection closed');
    };

    this.socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }
}
