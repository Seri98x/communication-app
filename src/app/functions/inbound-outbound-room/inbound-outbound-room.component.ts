import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { TwilioService } from 'src/app/services/twilio.service';
import { Device, Call } from '@twilio/voice-sdk';
import { AlertController } from '@ionic/angular';
import { IonContent, IonHeader, IonToolbar, IonCol, IonButton, IonRow, IonButtons, IonTitle, IonCard, IonCardContent, IonGrid, IonInput, IonBackButton, IonAlert } from "@ionic/angular/standalone";
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { addIcons } from "ionicons";
import { delay, Observable } from 'rxjs';
import { IonAlertCustomEvent,OverlayEventDetail } from '@ionic/core';

@Component({
  selector: 'app-inbound-outbound-room',
  standalone: true,
  templateUrl: './inbound-outbound-room.component.html',
  styleUrls: ['./inbound-outbound-room.component.scss'],
  imports: [IonAlert, CommonModule, FormsModule, IonBackButton, IonInput, IonGrid, IonCardContent, IonCard, IonTitle, IonButtons, IonRow, IonButton, IonCol, IonToolbar, IonHeader, IonContent]
})
export class InboundOutboundRoomComponent implements OnInit {
setResult($event: IonAlertCustomEvent<OverlayEventDetail<any>>) {
throw new Error('Method not implemented.');
}


setOpen(isOpen: boolean) {
  this.isAlertOpen = isOpen;
}

setOpen2(isOpen: boolean) {
  this.isAlertOpen2 = isOpen;
}


setOpen3(isOpen: boolean) {
  this.isAlertOpen3 = isOpen;
}

  phoneNumber: string = '';
  device: Device | null = null;
  callStartTime: Date | null = null;
  callInterval: any;
  
public currentCall: Call | null = null;
public isAlertOpen: boolean = false;
public isAlertOpen2: boolean = false;
public isAlertOpen3: boolean = false;
public alertButtons = [
  {
    text: 'Cancel',
    role: 'cancel',
    handler: () => {
      this.device?.destroy();
      this.twilioService.getAccessToken().subscribe({
      next: (tokenResponse) => {
        const token = tokenResponse.token.token;
        this.initializeDevice(token);
      }
    });
    },
  },

];


public alertButtons2 = [
  {
    text: 'Accept call',
    handler: () => {

      this.currentCall?.accept();
      this.isAlertOpen3 = true;
      
       
      
    },
  },
];

public alertButtons3 = [
  {
    text: 'Hangup',
    role: 'cancel',
    handler: () => {
      this.device?.destroy();
      this.twilioService.getAccessToken().subscribe({
      next: (tokenResponse) => {
        const token = tokenResponse.token.token;
        this.initializeDevice(token);
      }
    });
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

    

    this.device.on('incoming', (connection) => {
      this.currentCall = connection;
      while(this.isAlertOpen2 == false){
        this.isAlertOpen2 = true;
      
      }
    });
     
    this.device.on('error', (error) => console.error('Twilio Device Error:', error.message));
    this.device.register();
  }

  appendNumber(value: string) {

    this.phoneNumber += value;
  }

  clearLastCharacter() {
    this.phoneNumber = this.phoneNumber.slice(0, -1);
  }

  acceptCall2(call:Call) {

    this.isAlertOpen2 = true;

  }



  makeCall() {
  
    this.isAlertOpen = true;
    // const alert = await this.alertController.create({
    //   header: 'Call In Progress',
    //   message: `Call started at: ${this.callStartTime ? new Date(this.callStartTime).toLocaleTimeString() : ''}`,
    //   buttons: [
    //     {
    //       text: 'Hang Up',
    //       handler: () => {
    //         this.endCall();
    //       }
    //     }
    //   ]
    // })
    // this.alert = alert;f
    // await alert.present();
  
    try{
      if (this.device) {
    
        this.callStartTime = new Date(); // Record the start time
        this.device.connect({
          params: { To: this.phoneNumber }
        });
        console.log('Call initiated');
  
        // Show the alert with call time and hang-up button
       
      } else {
        console.error('Device not initialized');
      }
    }
    catch(err){
      console.log(err);
    }
   
   

  //  showCallAlert() {


   
  }

  getCallDuration(): string {
    const now = Date.now();
    const seconds = Math.floor((now - this.callStartTime!.getTime()) / 1000);
    return `${seconds} seconds`;
  }

  endCall() {
    if (this.device) {
      this.device.destroy(); // Adjust this based on your actual method to end the call
      this.twilioService.getAccessToken().subscribe({
        next: (tokenResponse) => {
          const token = tokenResponse.token.token;
          this.initializeDevice(token);
        },
        error: (err) => {
          console.error('Failed to get access token:', err);
        }
      });
      console.log('Call ended');
    } else {
      console.error('Device not initialized');
    }

    // if (this.alert) {
    //   this.alert.dismiss();
    // }
  }

  acceptCall(call:any) {
    call.accept();  
  }

   handleIncomingCall(connection: any) {
  
    this.callStartTime = new Date();
    this.currentCall = connection;
    // this.currentCall?.accept();


  }

  async showAlertDialog(currentCall:any) {

    console.log('Incoming call');
  
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
