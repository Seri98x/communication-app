import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

interface Message {
  from: string;
  to: string;
  body: string;
  timestamp: string;
}

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  private apiUrl = 'http://localhost:3000/api/'; // Replace with your server URL

  constructor(private http: HttpClient) { }

  getMessages(): Observable<Message[]> {
    return this.http.get<Message[]>(this.apiUrl+"messages");
  }

  sendSms(to: string, body: string,mediaUrl:string): Observable<any> {
    return this.http.post<any>(this.apiUrl+"send-sms", { to, body,mediaUrl });
  }
}
