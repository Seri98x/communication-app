import { CanMatchFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { inject } from '@angular/core';

export const authGuard: CanMatchFn = (route, segments) => {
      const authService = inject(AuthService);
      const router = inject(Router);

       const user = authService.checkAuth().then((user) => {
        
        if (user) {
          
          return true;
        } else {
          router.navigate(['/login'],{replaceUrl:true});
          return false;
        }
      }).catch((error) => {
        router.navigate(['/login'],{replaceUrl:true});
        return false;
      });

  return true;
};
