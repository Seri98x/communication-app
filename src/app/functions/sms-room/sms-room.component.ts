import { Component, OnInit } from '@angular/core';
import {IonContent, IonHeader, IonToolbar, IonButtons, IonBackButton, IonTitle, IonRow, IonGrid, IonCol, IonCard, IonCardHeader, IonItem, IonLabel, IonCardContent, IonCardTitle, IonList, IonInput, IonText, IonButton, IonTextarea } from "@ionic/angular/standalone";
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'src/app/services/message.service';
import { addIcons } from "ionicons";
import { WebSocketService } from 'src/app/services/websocket.service';
import { ChatService } from 'src/app/services/chat.service';

@Component({
  selector: 'app-sms-room',
  standalone: true,
  templateUrl: './sms-room.component.html',
  styleUrls: ['./sms-room.component.scss'],
  imports: [FormsModule,CommonModule,IonTextarea, IonButton, IonText, IonInput, IonList, IonCardTitle, IonCardContent, IonLabel, IonItem, IonCardHeader, IonCard, IonCol, IonGrid, IonRow, IonTitle, IonBackButton, IonButtons, IonToolbar, IonHeader, IonContent]
})
export class SmsRoomComponent  implements OnInit {
  public file : File | null = null;
onFileSelected($event: Event) {
  this.file = ($event.target as HTMLInputElement).files?.[0] || null;

  
}
  async sendSMS(): Promise<void> {
  if (this.to && this.body) {



 
      let fileUrl = await this.chatService.uploadFile(this.file!);
    
       



    this.messageService.sendSms(this.to, this.body,fileUrl).subscribe(
      response => {
        console.log('SMS sent successfully:', response);
        // Optionally clear input fields
        this.to = '';
        this.body = '';
      },
      error => {
        console.error('Error sending SMS:', error);
      }
    );
  } else {
    console.error('Please provide both recipient and message body.');
  }
}
messages: any[] = [];
to: string = '';
body: string = '';

  constructor(private messageService: MessageService,private webSocketService: WebSocketService,private chatService: ChatService) 
  {
  
   }


   
  
  ngOnInit() 
  {
    
    this.webSocketService.messages$.subscribe(newMessages => {
      console.log('New messages:', newMessages);
      this.messageService.getMessages().subscribe(data => {
        this.messages = data;
      });
    });
   
  }

}
