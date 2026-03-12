import { Component } from '@angular/core';
import { NgIf } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { AuthModal } from '../components/auth-modal/auth-modal';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [NgIf, AuthModal],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css']
})
export class Navbar {

  isMenuOpen = false;
  isScrolled = false;
  isAuthModalOpen = false;
  currentUser: any = null;

  constructor(private auth: AuthService) {

    this.auth.user$.subscribe(user => {
    this.currentUser = user;
  });

    window.addEventListener('scroll', () => {
      this.isScrolled = window.scrollY > 50;
    });
  }

  openAuthModal() {
    this.isAuthModalOpen = true;
  }

  closeAuthModal() {
    this.isAuthModalOpen = false;
  }

  logout() {
    this.auth.logout();
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
    document.body.style.overflow = this.isMenuOpen ? 'hidden' : 'auto';
  }
}
