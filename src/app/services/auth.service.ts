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

  constructor(    private apiService: ApiService,private fireStore:Firestore,    private fireAuth: Auth) { }

  async login (email:string,password:string): Promise<any> {
    const response = await signInWithEmailAndPassword(this.fireAuth!,email,password);
    if(response.user){
      this._uid.next(response.user.uid);
      this.getUserByEmail(email).then((user:any)=>
        {
          this._role_id.next(user.role_id);
          this._user_name.next(user.name);
        });
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