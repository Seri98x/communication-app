import { inject, Injectable } from '@angular/core';
import { Auth, signInWithEmailAndPassword } from '@angular/fire/auth';
import { BehaviorSubject, Observable } from 'rxjs';
import { ApiService } from './api.service';
import { collection, Firestore, getDocs, query, where } from '@angular/fire/firestore';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = 'http://localhost:3000/api'; // Adjust if your backend is hosted elsewhere

 
  public _uid = new BehaviorSubject<any>(null);  
  public _role_id = new BehaviorSubject<any>(null);
  public _user_name = new BehaviorSubject<any>(null);
  public _bearer_token = new BehaviorSubject<any>(null);
  public _email = new BehaviorSubject<any>(null); 
  public _user_id = new BehaviorSubject<any>(null);
  public _user = new BehaviorSubject<any>(null);
  public _password = new BehaviorSubject<any>(null);

  private oauth2Credentials = {
    web: {
      client_id: "108205539127-jd3tspjcmfl33o8sca91uqjgmhe84g41.apps.googleusercontent.com",
      project_id: "tonal-griffin-433815-i1",
      auth_uri: "https://accounts.google.com/o/oauth2/auth",
      token_uri: "https://oauth2.googleapis.com/token",
      auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
      client_secret: "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",
      redirect_uris: ["http://localhost:8100", "http://localhost:8080", "http://localhost:3000/", "http://localhost:3000/oauth2callback"]
    }
  };

  constructor(  private http: HttpClient, private apiService: ApiService,private fireStore:Firestore,    private fireAuth: Auth) { }

  async login (email:string,password:string): Promise<any> {
    const response = await signInWithEmailAndPassword(this.fireAuth!,email,password);
    if(response.user){
      this._uid.next(response.user.uid);
      this.getUserByEmail(email).then((user:any)=>
        {
          this._role_id.next(user.role_id);
          this._user_name.next(user.name);
          this._user_id.next(user.u_id);
          this._user.next(user.user);
          // this.authenticate(user.u_id).subscribe((user:any)=>{
          //   console.log(user);
          // });
       
        
        
          this._password.next(user.password);
          if(email  == "jose.m.ronquillo@gmail.com"){
            this._bearer_token.next("ya29.a0AcM612xJjUmvYYAZI4AKP6UbjOS267c-KjL76kvdyjK_PErICyzMBcnEB-tij-8Cen5lzpqCrUCcXq-f4dSx_1ISZ2OLBdxUU-zx-siS307YzV2Vp9FCW63MTO5yijLyX5FZU7DDCpk6TLzUISRXkehC7rKEyFMf90uz3uYaoQaCgYKAXMSARISFQHGX2MiKart7kFSdDQCReikSFVEvQ0177");
            this.tryListEmails("0").subscribe((response: any) => {
              console.log(response);
            });
          }
          else if(email == "josemarironquillo91@gmai.com")
            {
              this._bearer_token.next("ya29.a0AcM612zkC3K9wa-m80COWyhtqm43F7OkDVze8fGbd3vg0b88NXUvoBMVv4rvdcB2NF-30ibRhpdtdDAZTc5HmaJsRWsrYuHJYcf7nrPCFZglN4BTjXvwaCbo3lHJJCcLQfiywSsFpvc9DD-A-cBeCmX5FrQYm8nrLVNilOZBaCgYKAVASARESFQHGX2MiCR7IWwiQmyop5XTrXgOL4A0175");
              this.tryListEmails("1").subscribe((response: any) => {
                console.log(response);

              });
            }
            // this.handleOAuth2Callback("web",user.u_id);
        });
        this._email.next(email);
       
    }
  }

  async logout(){
    await this.fireAuth!.signOut();
    this._uid.next(null);
    return true;

  }
  

  tryListEmails(userId: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/authenticate`, {userId:userId}); // POST request with empty body

  }

  authenticate(userId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/authenticate`, { userId });
  }
  async handleOAuth2Callback(code: string, userId: string): Promise<void> {
    const { client_id, client_secret, redirect_uris } = this.oauth2Credentials.web;

    // Send the code, credentials, and user ID to the backend
    try {
      const response = await this.http.get(`${this.apiUrl}/oauth2callback`, {
        params: {
          code,
          clientId: client_id,
          clientSecret: client_secret,
          redirectUris: redirect_uris.join(','), // Convert array to comma-separated string
          userId
        }
      }).toPromise();
      
      // Handle the backend response if needed
      console.log('OAuth2 callback response:', response);
    } catch (error) {
      console.error('Error handling OAuth2 callback:', error);
    }
  }

  checkAuth(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.fireAuth!.onAuthStateChanged((user) => {
        if (user) {
          this._uid.next(user.uid);
          resolve(user);
        } else {
          reject(null);
        }
      });
    });
  }

  async getUserByEmail(email: string): Promise<any> {
   
    const userCollection = collection(this.fireStore, 'user_table');
    const userQuery = query(userCollection, where('email', '==', email));
    const querySnapshot = await getDocs(userQuery);

    // Check if there is at least one document matching the query
    if (!querySnapshot.empty) {
      // Return the first document's data
      return querySnapshot.docs[0].data();
    } else {
      return null; // or handle the case where no user is found
    }
}
}