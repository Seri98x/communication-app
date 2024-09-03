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
  @Input() modalController: any;

  constructor() {}

  dismiss() {
    this.modalController.dismiss();
  }

  getAttachmentUrl(base64Data: string, filename: string): string {
    const mimeType = this.getMimeType(filename);
        const blob = this.base64toBlob(base64Data, mimeType);
        return URL.createObjectURL(blob);
  }

  // Determine the MIME type based on the file extension
  getMimeType(filename: string): string {
    const ext = filename.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'txt': return 'text/plain';
      case 'jpg': return 'image/jpeg';
      case 'png': return 'image/png';
      case 'pdf': return 'application/pdf';
      default: return 'application/octet-stream';
    }
  }

   base64toBlob(base64Data: string, contentType: string = ''): Blob {
    const sliceSize = 1024;
    const byteCharacters =  atob(base64Data.replace(/-/g, "+").replace(/_/g, "/"));
    const bytesLength = byteCharacters.length;
    const slicesCount = Math.ceil(bytesLength / sliceSize);
    const byteArrays: Uint8Array[] = new Array(slicesCount);

    for (let sliceIndex = 0; sliceIndex < slicesCount; ++sliceIndex) {
        const begin = sliceIndex * sliceSize;
        const end = Math.min(begin + sliceSize, bytesLength);

        const bytes = new Array(end - begin);
        for (let offset = begin, i = 0; offset < end; ++i, ++offset) {
            bytes[i] = byteCharacters[offset].charCodeAt(0);
        }
        byteArrays[sliceIndex] = new Uint8Array(bytes);
    }
    return new Blob(byteArrays, { type: contentType });
}

}
