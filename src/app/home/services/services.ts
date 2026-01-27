import { 
  Component, 
  ElementRef, 
  ViewChild, 
  AfterViewInit 
} from '@angular/core';
import { NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [NgFor, NgIf],
  templateUrl: './services.html',
  styleUrl: './services.css'
})
export class Services implements AfterViewInit {

  @ViewChild('scrollContainer', { static: false }) 
  scrollContainer!: ElementRef<HTMLDivElement>;

  isDown = false;
  isHovered = false;
  startX = 0;
  startY = 0;
  scrollLeft = 0;

  clickStartX = 0;
  clickStartY = 0;

  services = [
    { 
      title: 'Strength Training', 
      image: 'assets/images/services/strength-training.webp',
      description: 'Strength training focuses on controlled, purposeful movements using free weights and machines. Each exercise builds stability, power and confidence, helping your body move more efficiently in everyday life. The progression is easy to follow, and learning proper technique gives many people a renewed sense of motivation and clarity in their training.'
    },
    { 
      title: 'Yoga Flow', 
      image: 'assets/images/services/yoga-flow.webp',
      description: 'Yoga Flow connects breath and movement in a smooth, continuous sequence. It improves flexibility, balance and core strength while helping you slow down and refocus. The transitions follow a natural rhythm, creating a practice that feels grounding and refreshing both physically and mentally.'
    },
    { 
      title: 'Kettlebell Workouts', 
      image: 'assets/images/services/kettle-bell-training.webp',
      description: 'Kettlebell training uses dynamic, swinging movements that develop strength, power and coordination at the same time. The whole body works together, especially the core and hips. The rhythm is energetic, the technique is rewarding to refine and the training offers a unique blend of challenge and flow.'
    },
    { 
      title: 'HIIT Training', 
      image: 'assets/images/services/hiit-training.webp',
      description: 'HIIT alternates short bursts of high-intensity effort with active recovery. Your heart rate rises quickly, and your body continues to burn energy long after the workout ends. It builds endurance, boosts metabolism and delivers a powerful training effect even in a shorter session.'
    },
    { 
      title: 'Functional Training', 
      image: 'assets/images/services/functional-training.webp',
      description: 'Functional training is built around natural movement patterns that enhance stability, mobility and overall strength. The exercises engage multiple muscle groups at once, supporting efficient movement in daily life. It’s a versatile style that adapts well to different fitness levels and training goals.'
    },
    { 
      title: 'Dance Workout Energy', 
      image: 'assets/images/services/dance-workout-training.webp',
      description: 'Dance Workout Energy blends rhythmic, music-driven movement with steady cardio work. The choreography is easy to follow, the pace gradually increases and the session becomes both uplifting and physically engaging. It improves coordination, body awareness and endurance while keeping the atmosphere light and enjoyable.'
    }
  ];

  autoScrollSpeed = 2;
  animationFrameId: number | null = null;

  ngAfterViewInit() {
    const container = this.scrollContainer.nativeElement;

    const step = () => {
      if (!this.isDown && !this.isHovered) {
        container.scrollLeft += this.autoScrollSpeed;

        if (container.scrollLeft >= container.scrollWidth / 2) {
          container.scrollLeft = 0;
        }
      }

      this.animationFrameId = requestAnimationFrame(step);
    };

    this.animationFrameId = requestAnimationFrame(step);
  }

  normalizeScrollPosition() {
    const container = this.scrollContainer.nativeElement;
    const half = container.scrollWidth / 2;

    if (container.scrollLeft >= half) {
      container.scrollLeft -= half;
    }

    if (container.scrollLeft < 0) {
      container.scrollLeft += half;
    }
  }

  onPointerDown(event: PointerEvent) {
    this.isDown = true;

    this.startX = event.clientX;
    this.startY = event.clientY;

    this.clickStartX = event.clientX;
    this.clickStartY = event.clientY;

    this.scrollLeft = this.scrollContainer.nativeElement.scrollLeft;
  }

  onPointerMove(event: PointerEvent) {
    if (!this.isDown) return;

    const x = event.clientX;
    const walk = (x - this.startX) * -1;

    const container = this.scrollContainer.nativeElement;
    container.scrollLeft = this.scrollLeft + walk;

    this.normalizeScrollPosition();
  }

  onCardPointerUp(event: PointerEvent, item: any) {
    this.isDown = false;

    this.normalizeScrollPosition();

    const dx = Math.abs(event.clientX - this.clickStartX);
    const dy = Math.abs(event.clientY - this.clickStartY);

    if (dx < 5 && dy < 5) {
      this.openModal(item);
    }
  }

  onPointerLeave() {
    this.isDown = false;
  }

  onMouseEnter() {
    this.isHovered = true;
  }

  onMouseLeave() {
    this.isHovered = false;
  }

  selectedItem: any = null;

  openModal(item: any) {
    this.selectedItem = item;
  }

  closeModal() {
    this.selectedItem = null;
  }
}
