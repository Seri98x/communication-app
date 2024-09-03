import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { EmailService } from 'src/app/services/email.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonButtons, IonInput, IonItem, IonToolbar, IonHeader, IonContent, IonCol, IonButton, 
  IonText, IonTextarea, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonGrid, 
  IonRow, IonLabel, IonBackButton, IonTitle, IonList, ModalController
} from '@ionic/angular/standalone';
import { Observable, of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { EmailModalComponent } from 'src/app/email-modal/email-modal.component';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-email-session',
  templateUrl: './email-session.component.html',
  styleUrls: ['./email-session.component.scss'],
  standalone: true,
  imports: [IonList, CommonModule, FormsModule, IonLabel, IonRow, IonGrid, IonCardContent, 
            IonCardTitle, IonCardHeader, IonCard, IonTextarea, IonText, IonButton, IonCol, 
            IonContent, IonHeader, IonToolbar, IonItem, IonInput, IonButtons, IonBackButton, 
            IonTitle]
})
export class EmailSessionComponent implements OnInit {
refresh() {
  this.tryFetch();
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
    private modalController: ModalController,
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.tryFetch();
  }

  async openEmail(message: any) {
    const modal = await this.modalController.create({
      component: EmailModalComponent,
      componentProps: {
        email: message,
        modalController: this.modalController
      }
    });
    return await modal.present();
  }

  clearEmail() {
    this.email = {
      to: '',
      subject: '',
      message: '',
      attachment: null
    };
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }


  tryFetch() {
    this.authService._user_id.subscribe((user_id) => {
      this.emailService.tryFetchEmails(user_id).subscribe(response => {
        this.messages = response || [];
        console.log('Emails fetched successfully:', this.messages);
      }, error => {
        console.error('Error fetching emails:', error);
      });
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
        return of([]);
      })
    ).subscribe();
  }

  sendEmail() {
    let user = '';
    let pass = '';
    let email = '';

    this.authService._user.subscribe((user_id) => {
      user = user_id;
      console.log(user);
    });
    this.authService._password.subscribe((password) => {
      pass = password;
    });
    this.authService._email.subscribe((email_id) => {
      email = email_id;
    } );

    if(email == "jose.m.ronquillo@gmail.com"){
      pass = "oxso jhql wrnf xbvb";
    }
    else if(email == "josemarironquillo91@gmail.com"){
      pass = "hojo qtzm kkgm vifq";
    }

    const emailData: any = {
      user: email,
      pass: pass,
      from: email,
      to: this.email.to,
      subject: this.email.subject,
      text: this.email.message,
      html: `<h1>${this.email.subject}</h1><p>${this.email.message}</p>`,
      attachments: [

      ]
    };

    // Convert attachment to base64 if it exists
    if (this.email.attachment) {
      this.convertFileToBase64(this.email.attachment).then(base64Content => {
        emailData.attachments.push({
          filename: this.email.attachment!.name,
          content: base64Content,
          encoding: 'base64'
        });

        // Now send the email
        console.log('Sending email with attachment:', emailData);
        this.emailService.sendEmail(emailData).subscribe({
          next: response => {

            console.log('Email sent successfully:', response);
            this.clearEmail();
          },
          error: err => {
            console.error('Error sending email:', err);
          }
        });
      });
    } else {
      // Send the email without attachments
      this.emailService.sendEmail(emailData).subscribe({
        next: response => {

          alert('Email sent successfully:');
    
          this.clearEmail(); // Clear the form after successful submission
        },
        error: err => {
          console.error('Error sending email:', err);
        }
      });
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.email.attachment = input.files[0];
    }
  }

  private convertFileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        resolve(base64.split(',')[1]); // Extract base64 content (skip metadata)
      };
      reader.onerror = error => reject(error);
      reader.readAsDataURL(file);
    });
  }
}
