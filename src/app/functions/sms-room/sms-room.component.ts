import { Component, OnInit } from '@angular/core';
import {IonContent} from "@ionic/angular/standalone";

@Component({
  selector: 'app-sms-room',
  standalone: true,
  templateUrl: './sms-room.component.html',
  styleUrls: ['./sms-room.component.scss'],
  providers: [IonContent]
})
export class SmsRoomComponent  implements OnInit {

  constructor() { }

  ngOnInit() {}

}
