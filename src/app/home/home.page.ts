import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {IonMenuButton,IonMenuToggle,IonMenu,IonHeader, IonToolbar, IonTitle, IonContent, IonItem, IonIcon, IonLabel, IonList, IonRouterOutlet, IonSplitPane, IonButtons, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonApp, IonFooter, IonButton } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { homeOutline,callOutline,chatbubblesOutline,mailOutline,chatboxEllipsesOutline } from 'ionicons/icons';
import { NavigationEnd, Router, RouterLinkWithHref, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { AuthService } from '../services/auth.service';


@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [IonButton, IonFooter, IonApp, CommonModule,RouterOutlet,RouterLinkWithHref,IonCardContent, IonCardTitle, IonCardHeader, IonCard, IonMenuButton,IonButtons, IonMenu,IonMenuToggle,IonSplitPane, IonRouterOutlet, IonList, IonLabel, IonIcon, IonItem, IonHeader, IonToolbar, IonTitle, IonContent],
})
export class HomePage {
logout() {
    this.authService.logout().then(() => {
      this.router.navigate(['/login'],{replaceUrl:true});
    });
}
  private router = inject(Router);
  public name : string = "";
  constructor(private authService: AuthService)  
  {
   this.authService._user_name.subscribe((name) => {
      this.name = name;
    });
    addIcons({homeOutline,callOutline,chatbubblesOutline,mailOutline,chatboxEllipsesOutline});
  }

  showCard: boolean = true;



  ngOnInit() {
    try {
      // Subscribe to router events to check the current route
      this.router.events.pipe(
        filter(event => event instanceof NavigationEnd)
      ).subscribe(() => {
        try {
          this.updateCardVisibility();
        } catch (error) {
          console.error('Error updating card visibility:', error);
        }
      });

      // Initial check
      try {
        this.updateCardVisibility();
      } catch (error) {
        console.error('Error during initial card visibility check:', error);
      }
    } catch (error) {
      console.error('Error during router events subscription:', error);
    }
  }

  updateCardVisibility() {
    try {
      // Check if the current route is '/home'
      this.showCard = this.router.url !== '/home';
    } catch (error) {
      console.error('Error in updateCardVisibility method:', error);
      // Handle the error or fallback as necessary
      this.showCard = true; // Default fallback
    }
  }
}
