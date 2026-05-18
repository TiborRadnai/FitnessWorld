import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {

  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  canActivate() {
console.log("🔥 GUARD FUT");

    // 🔥 1) A BehaviorSubject.value MINDIG tartalmaz valamit:
    //    - null → nincs bejelentkezve
    //    - User → be van jelentkezve
    const user = this.auth.currentUser;

    console.log('GUARD USER:', user);

    // 🔥 2) Ha nincs user → visszadobjuk
    if (!user) {
      this.router.navigate(['/']);
      return false;
    }

    // 🔥 3) Ha nem Daniel → visszadobjuk
    if (user.email !== 'daniel.ruitz@fitnessworld.com') {
      this.router.navigate(['/']);
      return false;
    }

    // 🔥 4) Ha minden ok → engedjük
    return true;
  }
}
