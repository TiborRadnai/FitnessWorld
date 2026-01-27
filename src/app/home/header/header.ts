import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';

interface Slide {
  image: string;
  subtitle: string;
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [NgFor, NgIf],
  templateUrl: './header.html',
  styleUrls: ['./header.css']
})
export class Header implements OnInit, OnDestroy {

  slides: Slide[] = [
    { image: 'assets/images/slider/slider1.webp', subtitle: 'Strength Training' },
    { image: 'assets/images/slider/slider2.webp', subtitle: 'Yoga Flow' },
    { image: 'assets/images/slider/slider3.webp', subtitle: 'Kettlebell Workouts' },
    { image: 'assets/images/slider/slider4.webp', subtitle: 'HIIT Training' },
    { image: 'assets/images/slider/slider5.webp', subtitle: 'Functional Training' },
    { image: 'assets/images/slider/slider6.webp', subtitle: 'Dance Workout Energy' }
  ];

  currentIndex = 0;
  intervalId: any;

  get currentSubtitle(): string {
    return this.slides[this.currentIndex].subtitle;
  }

  ngOnInit() {
    this.intervalId = setInterval(() => {
      this.currentIndex = (this.currentIndex + 1) % this.slides.length;
    }, 5000);
  }

  ngOnDestroy() {
    clearInterval(this.intervalId);
  }

  showControls = false;
hoverTimeout: any;

startHoverTimer() {
  clearTimeout(this.hoverTimeout);
  this.hoverTimeout = setTimeout(() => {
    this.showControls = true;
  }, 1500); // 3 mp késleltetés
}

hideControls() {
  clearTimeout(this.hoverTimeout);
  this.showControls = false;
}

nextSlide() {
  this.currentIndex = (this.currentIndex + 1) % this.slides.length;
}

prevSlide() {
  this.currentIndex =
    (this.currentIndex - 1 + this.slides.length) % this.slides.length;
}

goToSlide(index: number) {
  this.currentIndex = index;
}

}
