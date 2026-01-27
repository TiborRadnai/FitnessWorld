import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from './shared/navbar/navbar'; 
import { Footer } from './shared/footer/footer'; 
import { BackToTop } from './shared/back-to-top/back-to-top';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar, Footer, BackToTop],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('tempapp');

  ngOnInit() {
  let isTouchpad = false;
  let lastTime = 0;

  window.addEventListener('wheel', (e) => {
    const now = Date.now();
    const delta = e.deltaY;

    // Touchpad detektálás (kisebb delta, gyors ismétlődés)
    if (Math.abs(delta) < 50 || now - lastTime < 50) {
      isTouchpad = true;
    }
    lastTime = now;

    if (isTouchpad) return; // touchpad → normál scroll

    e.preventDefault();

    const direction = delta > 0 ? 1 : -1;
    const sections = Array.from(document.querySelectorAll('section'));
    const current = sections.findIndex(sec => sec.getBoundingClientRect().top >= -10);

    const nextIndex = Math.min(sections.length - 1, Math.max(0, current + direction));
    sections[nextIndex].scrollIntoView({ behavior: 'smooth' });
  }, { passive: false });
}

}
