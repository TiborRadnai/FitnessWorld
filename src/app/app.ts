import { Component, signal } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';   // <-- EZ KELL
import { Navbar } from './shared/navbar/navbar';
import { Footer } from './shared/footer/footer';
import { BackToTop } from './shared/back-to-top/back-to-top';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, Navbar, Footer, BackToTop, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {

  title = signal('tempapp');
  isAdminRoute = signal(false);

  constructor(private router: Router) {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.isAdminRoute.set(event.url.startsWith('/admin'));
      });
  }

  ngOnInit() {
    let isTouchpad = false;
    let lastTime = 0;

    window.addEventListener('wheel', (e) => {

      // 🔥 ADMIN OLDALON TILTSUK LE
      if (this.isAdminRoute()) return;

      const now = Date.now();
      const delta = e.deltaY;

      if (Math.abs(delta) < 50 || now - lastTime < 50) {
        isTouchpad = true;
      }
      lastTime = now;

      if (isTouchpad) return;

      e.preventDefault();

      const direction = delta > 0 ? 1 : -1;
      const sections = Array.from(document.querySelectorAll('section'));

      // 🔥 HA NINCS SECTION, NE FUSSON TOVÁBB
      if (sections.length === 0) return;

      const current = sections.findIndex(sec => sec.getBoundingClientRect().top >= -10);

      const nextIndex = Math.min(sections.length - 1, Math.max(0, current + direction));

      // 🔥 BIZTONSÁGI ELLENŐRZÉS
      if (!sections[nextIndex]) return;

      sections[nextIndex].scrollIntoView({ behavior: 'smooth' });

    }, { passive: false });
  }

}
