import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-back-to-top',
  standalone: true,
  templateUrl: './back-to-top.html'
})
export class BackToTop implements OnInit {

  isVisible = false;
  snapContainer!: HTMLElement;
  sections!: NodeListOf<HTMLElement>;

  ngOnInit() {
    this.snapContainer = document.querySelector('.snap-container') as HTMLElement;
    this.sections = this.snapContainer.querySelectorAll('section');

    // Figyeljük a snap-container scroll eseményét
    this.snapContainer.addEventListener('scroll', () => {
      this.updateVisibility();
    });

    // Első frissítés
    this.updateVisibility();
  }

  updateVisibility() {
    const containerTop = this.snapContainer.scrollTop;
    const vh = window.innerHeight;

    const activeIndex = Math.round(containerTop / vh);

    // Csak akkor mutassuk, ha:
    // - nem az első szekció (activeIndex > 0)
    // - ÉS legalább fél viewportnyit lejjebb vagyunk
    this.isVisible = activeIndex > 0 && containerTop > vh * 0.5;
  }

  scrollToTop() {
    this.snapContainer.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }
}
