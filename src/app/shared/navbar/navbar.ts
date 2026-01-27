import { Component } from '@angular/core';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [NgIf],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css']
})
export class Navbar {

  isMenuOpen = false;
  isScrolled = false;

  constructor() {
    window.addEventListener('scroll', () => {
      this.isScrolled = window.scrollY > 50;
    });
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
    document.body.style.overflow = this.isMenuOpen ? 'hidden' : 'auto';
  }
}
