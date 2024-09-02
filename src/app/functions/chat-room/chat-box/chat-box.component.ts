import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonItem, IonLabel, IonText, IonNote, IonIcon, IonAvatar, IonButton } from "@ionic/angular/standalone";
import { DatePipe } from '@angular/common';
import { getBlob, getDownloadURL, getStorage, ref } from '@angular/fire/storage';

@Component({
  selector: 'app-chat-box',
  standalone: true,
  templateUrl: './chat-box.component.html',
  styleUrls: ['./chat-box.component.scss'],
  imports: [IonButton, IonAvatar, CommonModule,DatePipe,IonIcon, IonNote, IonText, IonLabel, IonItem]
})
export class ChatBoxComponent implements OnInit  {
await: any;
isImageUrl(url: string): boolean {
  // Extract the file extension from the URL
  const fileExtension = url.split('.').pop()?.split('?')[0]; // Handles URL query parameters

  // Define a list of accepted image formats
  const imageFormats = ['png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp'];

  // Check if the file extension matches any of the image formats
  return imageFormats.includes(fileExtension?.toLowerCase() || '');
}
@Input() chat: any;
@Input() current_user_id: any;
isImage: boolean = false;

  constructor() { 
  

  }
  ngOnInit(): void {
    this.isImage = this.isImageUrl(this.chat.file_url);
    console.log(this.isImage);

    const storage = getStorage();

    const httpsReference = ref(storage, this.chat.file_url);  
    console.log(httpsReference);

  }


  downloadFile(fileUrl: string) {
    const storage = getStorage();
    const httpsReference = ref(storage, fileUrl);  

    // Extract and decode the file name from the URL
    const urlSplit = fileUrl.split('/');
    const encodedFileName = urlSplit[urlSplit.length - 1];
    const fileName = decodeURIComponent(encodedFileName.split('?')[0]); // Remove any query parameters and decode

    console.log(httpsReference.fullPath);
    getBlob(httpsReference)
        .then((blob) => {
            const href = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = href;
            a.style.display = 'none';
            a.download = fileName; // Name the file correctly
            document.body.appendChild(a);
            a.click();
            URL.revokeObjectURL(href);
            a.remove();
        })
        .catch((error) => {
            console.error('Error downloading file:', error);
        });
  }
  


  

}
