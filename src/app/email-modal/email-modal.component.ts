import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import {IonContent, IonHeader, IonTitle, IonButton, IonToolbar, IonButtons, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonList, IonItem, IonLabel } from '@ionic/angular/standalone';

@Component({
  selector: 'app-email-modal',
  standalone: true,
  templateUrl: './email-modal.component.html',
  styleUrls: ['./email-modal.component.scss'],
  imports: [CommonModule,IonContent,IonLabel, IonItem, IonList, IonCardContent, IonCardSubtitle, IonCardTitle, IonCardHeader, IonCard, IonButtons, IonToolbar, IonButton, IonTitle, IonHeader, ]
})
export class EmailModalComponent {
  @Input() email: any;

  constructor() {}

  dismiss() {
    // Method to close the modal
  }

  getAttachmentUrl(base64Data: string, filename: string): string {
    // Decode base64 data to binary
    const binaryString = window.atob(base64Data);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    // Create a Blob from the binary data
    const blob = new Blob([bytes], { type: 'application/octet-stream' });
    
    // Create a URL for the Blob
    return URL.createObjectURL(blob);
  }
}
