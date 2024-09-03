import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EmailService {

  private apiUrl = 'http://localhost:3001/api'; // Adjust if your backend is hosted elsewhere

  constructor(private http: HttpClient) { }

  // Fetch emails from the backend
  fetchEmails(): Observable<any> {
    return this.http.get(`${this.apiUrl}/list`);
  }

  tryFetchEmails(): Observable<any> {
    return this.http.get(`${this.apiUrl}/try-list`);
    
  }

  // Send an email through the backend
  sendEmail(email: any): Observable<any> {
    const formData = new FormData();
    formData.append('to', email.to);
    formData.append('subject', email.subject);
    formData.append('message', email.message);

    if (email.attachment) {
      formData.append('attachment', email.attachment);
    }

    return this.http.post(`${this.apiUrl}/send`, formData);
  }
}
