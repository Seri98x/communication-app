import { Component, OnInit } from '@angular/core';
import { addIcons } from "ionicons";
import { IonHeader, IonToolbar, IonButtons, IonBackButton, IonTitle, IonContent } from "@ionic/angular/standalone";

@Component({
  selector: 'app-inbound-outbound-room',
  standalone: true,
  imports: [IonContent, IonTitle, IonBackButton, IonButtons, IonToolbar, IonHeader],
  templateUrl: './inbound-outbound-room.component.html',
  styleUrls: ['./inbound-outbound-room.component.scss'],
})
export class InboundOutboundRoomComponent  implements OnInit {

  constructor() { }

  ngOnInit() {}

}
