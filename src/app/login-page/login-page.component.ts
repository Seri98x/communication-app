import { Component, inject, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { IonInputPasswordToggle,IonContent, IonList, IonItem, IonLabel, IonInput, IonCardHeader, IonCard, IonCardSubtitle, IonCardContent, IonCardTitle, IonButton } from "@ionic/angular/standalone";
import { FormBuilder, FormGroup, Validators,ReactiveFormsModule } from '@angular/forms';
import { Route, Router, RouterOutlet } from '@angular/router';
@Component({
  selector: 'app-login-page',
  standalone: true,
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss'],
  imports: [IonButton, IonInputPasswordToggle,IonCardTitle, IonCardContent, IonCardSubtitle, IonCard, IonCardHeader, ReactiveFormsModule,IonInput, IonContent, IonList, IonItem, IonLabel]
})
export class LoginPageComponent  implements OnInit {

  ngAfterViewInit(): void {
    const user = this.authService.checkAuth().then((user) => {
      if (user) {
        this.router.navigate(['/home'],{replaceUrl:true});
        return true;
      } else {
        this.router.navigate(['/login'],{replaceUrl:true});
        return false;
      }
    }).catch((error) => {
      this.router.navigate(['/login'],{replaceUrl:true});
      return false;
    });
    
  }
login() {
  this.authService.login(this.loginForm.value.email, this.loginForm.value.password).catch((error) => {
    
  });
  this.authService._role_id.subscribe((role_id) => {
      if(role_id) {
        this.router.navigate(['/home']);


        
      }
  });
}
  
  loginForm: FormGroup;
  
    constructor(private authService : AuthService,private formBuilder: FormBuilder
    ,private router: Router) 
    {
      
      this.loginForm = this.formBuilder.group({
        email: ['',Validators.required],
        password: ['',Validators.required]
      })
    } 

 async ngOnInit(): Promise<void> 
 {
    //  this.authService.login(this.emailToSearch, this.passwordToSearch).catch((error) => {
    //     console.log(error);
    //  });

    //  console.log(this.authService._role_id.subscribe((role_id) => {
    //    console.log(role_id);
    //  }));
 }

}
