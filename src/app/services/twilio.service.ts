import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {Device} from '@twilio/voice-sdk';

@Injectable({
  providedIn: 'root'
})
export class TwilioService {
 

  private apiUrl = 'http://localhost:3000/api/'; // Adjust if your backend is hosted elsewhere

  constructor(private http: HttpClient) 
  {

    
  }


  getAccessToken() :Observable<any> {
    return this.http.get<any>(`${this.apiUrl}get-token`, {}); // POST request with empty body
  }

  makeCall(phoneNumber: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}make-call`, {phoneNumber:phoneNumber}); // POST request with empty body
  }



}
