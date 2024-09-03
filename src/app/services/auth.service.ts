import { inject, Injectable } from '@angular/core';
import { Auth, signInWithEmailAndPassword } from '@angular/fire/auth';
import { BehaviorSubject } from 'rxjs';
import { ApiService } from './api.service';
import { collection, Firestore, getDocs, query, where } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class AuthService {


 
  public _uid = new BehaviorSubject<any>(null);  
  public _role_id = new BehaviorSubject<any>(null);
  public _user_name = new BehaviorSubject<any>(null);
  public _bearer_token = new BehaviorSubject<any>(null);
  public _email = new BehaviorSubject<any>(null); 

  constructor(    private apiService: ApiService,private fireStore:Firestore,    private fireAuth: Auth) { }

  async login (email:string,password:string): Promise<any> {
    const response = await signInWithEmailAndPassword(this.fireAuth!,email,password);
    if(response.user){
      this._uid.next(response.user.uid);
      this.getUserByEmail(email).then((user:any)=>
        {
          this._role_id.next(user.role_id);
          this._user_name.next(user.name);
          if(email  == "jose.m.ronquillo@gmail.com"){
            this._bearer_token.next("ya29.a0AcM612xJjUmvYYAZI4AKP6UbjOS267c-KjL76kvdyjK_PErICyzMBcnEB-tij-8Cen5lzpqCrUCcXq-f4dSx_1ISZ2OLBdxUU-zx-siS307YzV2Vp9FCW63MTO5yijLyX5FZU7DDCpk6TLzUISRXkehC7rKEyFMf90uz3uYaoQaCgYKAXMSARISFQHGX2MiKart7kFSdDQCReikSFVEvQ0177");
          }
          else if(email == "josemarironquillo91@gmai.com")
            {
              this._bearer_token.next("ya29.a0AcM612zkC3K9wa-m80COWyhtqm43F7OkDVze8fGbd3vg0b88NXUvoBMVv4rvdcB2NF-30ibRhpdtdDAZTc5HmaJsRWsrYuHJYcf7nrPCFZglN4BTjXvwaCbo3lHJJCcLQfiywSsFpvc9DD-A-cBeCmX5FrQYm8nrLVNilOZBaCgYKAVASARESFQHGX2MiCR7IWwiQmyop5XTrXgOL4A0175");
            }
        });
        this._email.next(email);
        
    }
  }

  async logout(){
    await this.fireAuth!.signOut();
    this._uid.next(null);
    return true;

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