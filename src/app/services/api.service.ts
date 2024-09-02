import { Injectable } from '@angular/core';
import { doc, Firestore, getDoc } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(private firestore:Firestore) 
  {
    
   }

   docRef(path:string){
     return doc(this.firestore,path);
   }

   getDocByEmail(path:string){
     const dataRef = this.docRef(path);
     return getDoc(dataRef);
   }
}
