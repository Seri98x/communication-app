import { authGuard } from './guards/auth.guard';
import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
    canMatch:[authGuard],
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'home/email',
    loadComponent: () => import('./functions/email-session/email-session.component').then((m) => m.EmailSessionComponent),
    canMatch:[authGuard],
  },
  {
    path: 'home/chat',
    loadComponent: () => import('./functions/chat-room/chat-room.component').then((m) => m.ChatRoomComponent),
    canMatch:[authGuard],
  },

  {
    path: 'home/sms',
    loadComponent: () => import('./functions/sms-room/sms-room.component').then((m) => m.SmsRoomComponent),
    canMatch:[authGuard],
  },
  {
    path: 'home/voice-call',
    loadComponent: () => import('./functions/inbound-outbound-room/inbound-outbound-room.component').then((m) => m.InboundOutboundRoomComponent),
    canMatch:[authGuard],
   },
  {
    path: 'login',
    loadComponent: () => import('./login-page/login-page.component').then((m) => m.LoginPageComponent),
  },
];
