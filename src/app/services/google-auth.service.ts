import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class GoogleAuthService {
  public  CLIENT_ID = 'YOUR_CLIENT_ID';
  public  API_KEY = 'YOUR_API_KEY';
  private readonly DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest"];
  private readonly SCOPES = 'https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/gmail.readonly';
  public email: string = '';  

  private gapi: any;

  constructor(private http: HttpClient) {
    this.initializeGapi("108205539127-jd3tspjcmfl33o8sca91uqjgmhe84g41.apps.googleusercontent.com","AIzaSyBjJNqnDIrbdW34txqt17T12zPF2l1H10E");
  }
  private initializeGapi(client_id:string,api_key:string): void {
   

    this.gapi.load('client:auth2', () => {
      this.gapi.client.init({
        apiKey: api_key,
        clientId: client_id,
        discoveryDocs: this.DISCOVERY_DOCS,
        scope: this.SCOPES
      }).then(() => {
      }).catch((error: any) => {
        console.error('Error initializing GAPI client', error);
      });
    });
  }

  public signIn(): void {
    this.gapi.auth2.getAuthInstance().signIn();
  }

  public signOut(): void {
    this.gapi.auth2.getAuthInstance().signOut();
  }

  public sendEmail(to: string, subject: string, body: string): Observable<any> {
    const raw = [
      `To: ${to}`,
      `Subject: ${subject}`,
      '',
      body
    ].join('\n');

    const encodedMessage = window.btoa(raw).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

    return new Observable(observer => {
      this.gapi.client.gmail.users.messages.send({
        'userId': 'me',
        'resource': {
          'raw': encodedMessage
        }
      }).then((response: any) => {
        observer.next(response);
        observer.complete();
      }).catch((error: any) => {
        observer.error(error);
      });
    });
  }

  public listEmails(): Observable<any> {
    return new Observable(observer => {
      this.gapi.client.gmail.users.messages.list({
        'userId': 'me',
        'maxResults': 10
      }).then((response: { result: { messages: any; }; }) => {
        observer.next(response.result.messages);
        observer.complete();
      }).catch((error: any) => {
        observer.error(error);
      });
    });
  }
}
