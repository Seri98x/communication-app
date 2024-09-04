import { Component, OnInit } from '@angular/core';
import { addIcons } from "ionicons";
import { IonHeader, IonToolbar, IonButtons, IonBackButton, IonTitle, IonContent, IonButton, IonCol, IonRow, IonGrid, IonCardContent, IonCard, IonInput } from "@ionic/angular/standalone";
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-inbound-outbound-room',
  standalone: true,
  imports: [CommonModule,FormsModule,IonInput, IonCard, IonCardContent, IonGrid, IonRow, IonCol, IonButton, IonContent, IonTitle, IonBackButton, IonButtons, IonToolbar, IonHeader],
  templateUrl: './inbound-outbound-room.component.html',
  styleUrls: ['./inbound-outbound-room.component.scss'],
})
export class InboundOutboundRoomComponent  implements OnInit {
phoneNumber: string = '';


appendNumber(value: string) {

  this.phoneNumber += value;
}
clearLastCharacter() {
  this.phoneNumber = this.phoneNumber.slice(0, -1);
}
  constructor() { }

  ngOnInit() {}

}
