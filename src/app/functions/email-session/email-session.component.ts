import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { EmailService } from 'src/app/services/email.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonButtons, IonInput, IonItem, IonToolbar, IonHeader, IonContent, IonCol, IonButton, 
  IonText, IonTextarea, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonGrid, 
  IonRow, IonLabel, IonBackButton, IonTitle, IonList ,ModalController} from '@ionic/angular/standalone';
import { Observable, of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { EmailModalComponent } from 'src/app/email-modal/email-modal.component';

@Component({
  selector: 'app-email-session',
  templateUrl: './email-session.component.html',
  styleUrls: ['./email-session.component.scss'],
  standalone: true,
  imports: [IonList, 
    CommonModule, FormsModule, IonLabel, IonRow, IonGrid, IonCardContent, IonCardTitle, 
    IonCardHeader, IonCard, IonTextarea, IonText, IonButton, IonCol, IonContent, IonHeader, 
    IonToolbar, IonItem, IonInput, IonButtons, IonBackButton, IonTitle
  ]
})
export class EmailSessionComponent implements OnInit {

  async openEmail(message: any) {
    const modal = await this.modalController.create({
      component: EmailModalComponent,
      componentProps: {
        email: message
      }
    });
    return await modal.present();
  }
clearEmail() {
throw new Error('Method not implemented.');
}
  email = {
    to: '',
    subject: '',
    message: '',
    attachment: null as File | null
  };

  messages: any[] = [];
  isAuthenticated = false;

  @ViewChild('fileInput', { static: false }) fileInput!: ElementRef<HTMLInputElement>;

  constructor(
    private http: HttpClient,
    private emailService: EmailService,
    private modalController: ModalController // Inject ModalController
  ) { }

  ngOnInit() {
    // this.checkAuthentication();
    this.tryFetch();
  }

  checkAuthentication() {
    // Check if user is authenticated by contacting your backend
    this.http.get('/api/check-auth').subscribe((response: any) => {
      if (response.authenticated) {
        this.isAuthenticated = true;
        this.fetchEmails();
        
      } else {
        // Redirect to backend for authentication
        window.location.href = '/auth';
      }
    });
  }
  tryFetch() {
    this.emailService.tryFetchEmails().subscribe(response => {
      this.messages = response || [];
      console.log('Emails fetched successfully:', this.messages);
    }, error => {
      console.error('Error fetching emails:', error);
    });
  }
  

  fetchEmails() {
    this.emailService.fetchEmails().pipe(
      switchMap((response: any) => {
        this.messages = response || [];
        console.log('Emails fetched successfully:', this.messages);
        return of(this.messages);
      }),
      catchError(error => {
        console.error('Error fetching emails:', error);
        return of([]); // Return an empty array in case of error
      })
    ).subscribe();
  }
  
  sendEmail() {
    this.emailService.sendEmail(this.email).subscribe(response => {
      console.log('Email sent successfully:', response);
    }, error => {
      console.error('Error sending email:', error);
    });
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.email.attachment = input.files[0];
    }
  }
}
