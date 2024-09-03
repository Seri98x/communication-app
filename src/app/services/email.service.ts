import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
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

  tryFetchEmails(userId:string): Observable<any> {
 // Use HttpParams to append the query parameter
 const params = new HttpParams().set('userId', userId);

 return this.http.get<any>(`${this.apiUrl}/try-list`, { params });
  }

  // Send an email through the backend
  sendEmail(emailData: {
    user: string,
    pass: string,
    from: string,
    to: string,
    subject: string,
    text: string,
    html: string,
    attachments?: Array<{ filename: string, path?: string, content?: any }>
  }): Observable<any> {
    // Set headers if necessary, for example, for JSON content
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    // POST request to backend API
    return this.http.post(`${this.apiUrl}/send-email`, emailData, { headers });
  }
}
