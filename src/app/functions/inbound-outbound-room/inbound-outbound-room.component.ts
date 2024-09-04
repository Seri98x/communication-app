import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { TwilioService } from 'src/app/services/twilio.service';
import { Device, Call } from '@twilio/voice-sdk';
import { AlertController } from '@ionic/angular';
import { IonContent, IonHeader, IonToolbar, IonCol, IonButton, IonRow, IonButtons, IonTitle, IonCard, IonCardContent, IonGrid, IonInput, IonBackButton, IonAlert } from "@ionic/angular/standalone";
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { addIcons } from "ionicons";

@Component({
  selector: 'app-inbound-outbound-room',
  standalone: true,
  templateUrl: './inbound-outbound-room.component.html',
  styleUrls: ['./inbound-outbound-room.component.scss'],
  imports: [IonAlert, CommonModule, FormsModule, IonBackButton, IonInput, IonGrid, IonCardContent, IonCard, IonTitle, IonButtons, IonRow, IonButton, IonCol, IonToolbar, IonHeader, IonContent]
})
export class InboundOutboundRoomComponent implements OnInit {

@ViewChild('alertContainer', { static: false }) alertContainer: ElementRef | undefined;
@ViewChild('button-accept', { static: false }) buttonAlert: ElementRef | undefined;

setOpen(arg0: boolean) {
throw new Error('Method not implemented.');
}

  phoneNumber: string = '';
  device: Device | null = null;
  callStartTime: Date | null = null;
  callInterval: any;
  currentCall: Call | null = null;
  alert: HTMLIonAlertElement | null = null;
isAlertOpen: boolean = false;
public alertButtons = [
  {
    text: 'Cancel',
    role: 'cancel',
    handler: () => {
      this.currentCall?.disconnect();

    },
  },
  {
    text: 'Answer',
    role: 'confirm',
    handler: () => {
      this.currentCall?.accept();
    },
  },
];

  constructor(
    private twilioService: TwilioService,
    private alertController: AlertController
  ) { }

  ngOnInit() {
    this.twilioService.getAccessToken().subscribe({
      next: (tokenResponse) => {
        const token = tokenResponse.token.token;
        this.initializeDevice(token);
      },
      error: (err) => {
        console.error('Failed to get access token:', err);
      }
    });

    const call = null;
    
  }

  

  initializeDevice(token: string) {
    this.device = new Device(token, {
      logLevel: 1,
      codecPreferences: [Call.Codec.Opus, Call.Codec.PCMU],
    });

    this.device.on('incoming', this.handleIncomingCall);
    this.device.on('error', (error) => console.error('Twilio Device Error:', error.message));
    this.device.register();
  }

  appendNumber(value: string) {
    this.phoneNumber += value;
  }

  clearLastCharacter() {
    this.phoneNumber = this.phoneNumber.slice(0, -1);
  }

  makeCall() {
    if (this.device) {
      this.device.connect({
        params: { To: this.phoneNumber }
      });
      console.log('Call initiated');
    } else {
      console.error('Device not initialized');
    }
  }

  acceptCall(call:any) {
    call.accept();  
  }

   handleIncomingCall(connection: any) {
  
    this.callStartTime = new Date();
    this.currentCall = connection;
    this.currentCall?.accept();


  }

  async showAlertDialog(currentCall:any) {
  
    const alert =  await this.alertController.create({
      header: 'Incoming Call',
      message: 'You have an incoming call. Call Time: 0m 0s',
      buttons: [
        {
          text: 'Accept',
          handler: () => {
            if (currentCall) {
              currentCall.accept();

            }
          }
        },
        {
          text: 'Hang Up',
          role: 'cancel',
          handler: () => {
            if (currentCall) {
              currentCall.disconnect();

            
            }
          }
        }
      ]
    }).then((alert) => {
      alert.present();
    });

 
  }

  startCallTimer() {
    this.callInterval = setInterval(() => {
      if (this.callStartTime) {
        const elapsed = new Date().getTime() - this.callStartTime.getTime();
        const minutes = Math.floor((elapsed / 1000 / 60) % 60);
        const seconds = Math.floor((elapsed / 1000) % 60);
        const message = `You have an incoming call. Call Time: ${minutes}m ${seconds}s`;
      }
    }, 1000);
  }


}
