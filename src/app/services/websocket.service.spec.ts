import { TestBed } from '@angular/core/testing';

import { WebSocketService } from '../services/websocket.service';

describe('WebsocketService', () => {
  let service: WebSocketService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WebSocketService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
