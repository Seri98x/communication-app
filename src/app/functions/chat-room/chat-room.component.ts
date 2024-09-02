import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { send, attachOutline } from 'ionicons/icons';
import { ChatBoxComponent } from './chat-box/chat-box.component';
import { IonButtons, IonInput, IonItem, IonRow, IonToolbar, IonFooter, IonHeader, IonContent, IonCol, IonButton, IonIcon, IonText, IonTextarea, IonFab, IonFabButton, IonSpinner, IonBackButton, IonTitle, IonList, IonItemGroup, IonLabel } from "@ionic/angular/standalone";
import { addIcons } from 'ionicons';
import { ChatService } from 'src/app/services/chat.service';
import { AuthService } from 'src/app/services/auth.service';
import { getDownloadURL, getStorage, ref } from '@angular/fire/storage';


@Component({
  selector: 'app-chat-room',
  standalone: true,
  templateUrl: './chat-room.component.html',
  styleUrls: ['./chat-room.component.scss'],
  imports: [IonLabel, IonItemGroup, IonList, ChatBoxComponent, IonTitle, IonBackButton, IonSpinner, IonFabButton, IonFab, FormsModule, CommonModule, IonTextarea, IonText, IonButtons, IonInput, IonItem, IonRow, IonToolbar, IonFooter, IonIcon, IonButton, IonCol, IonContent, IonHeader]
})
export class ChatRoomComponent implements OnInit, OnDestroy {
  isAttached: boolean = false;
  fileName: string = '';
  
onFileSelected($event: Event) {
     const file = ($event.target as HTMLInputElement).files?.[0];
      if (file) {
        this.isAttached = true;
        this.fileName = file.name;
        this.selectedFile = file;
        console.log(this.selectedFile);
      
      }
}
  messages: any[] = [];
  isLoading: boolean = false;
  currentUserId: string = '';
  message: string = '';
  unsubscribe: () => void = () => {};
  selectedFile: File | null = null;

  constructor(private chatService: ChatService, private authService: AuthService) {
    this.authService._uid.subscribe((user_id) => {
      this.currentUserId = user_id;
    });
  }

  ngOnInit() {
    addIcons({ send, attachOutline });


    this.isLoading = true;

    // Start listening for real-time updates
    this.unsubscribe = this.chatService.getMessages("0", (messages) => {
      this.messages = messages;
      this.isLoading = false;
    });
  }

  ngOnDestroy() {
    // Clean up the real-time listener when the component is destroyed
    this.unsubscribe();
  }

 async sendMessage() {
  if (this.message || this.selectedFile) {
    let fileUrl = '';
    if (this.selectedFile) {
      fileUrl = await this.chatService.uploadFile(this.selectedFile);
    }
    this.chatService.sendMessage(this.message, this.currentUserId, fileUrl).then(() => {
      this.message = '';
      this.selectedFile = null; // Clear file selection
    });
  }
}

async downloadFile(fileUrl: string) {
  // Implement file download logic here

  const storage = getStorage();
  getDownloadURL(ref(storage, 'images/stars.jpg'))
    .then((url) => {
      // `url` is the download URL for 'images/stars.jpg'
  
      // This can be downloaded directly:
      const xhr = new XMLHttpRequest();
      xhr.responseType = 'blob';
      xhr.onload = (event) => {
        const blob = xhr.response;
      };
      xhr.open('GET', url);
      xhr.send();
  
});
}

}