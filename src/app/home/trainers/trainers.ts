import { Component } from '@angular/core';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-trainers',
  standalone: true,
  imports: [NgIf],
  templateUrl: './trainers.html',
  styleUrl: './trainers.css'
})
export class Trainers {
  trainer1 = {
    nickName: 'Alex',
    name: 'Alex Morgan',
    role: 'Strength & Conditioning',
    image: 'assets/images/trainers/alex.webp',
    modalImage: 'assets/images/trainers/modal/alex.webp',  
    bio: 'Alex focuses on functional strength and stability. His sessions are technique‑driven yet dynamic, helping you build power with precision.'
  };

  trainerZ = {
    nickName: 'Daniel',
    name: 'Daniel Ruiz',
    role: 'HIIT & Cardio',
    image: 'assets/images/trainers/ethan.webp',
    modalImage: 'assets/images/trainers/modal/ethan.webp',  
    bio: 'Daniel delivers high‑energy workouts built around short, intense intervals that push your limits and accelerate progress.'
  };

  trainer2 = {
    nickName: 'Mia',
    name: 'Mia Hart',
    role: 'Functional Training',
    image: 'assets/images/trainers/mia.webp',
    modalImage: 'assets/images/trainers/modal/mia.webp',  
    bio: 'Mia works with natural movement patterns, helping you rediscover effortless, stable motion and a stronger connection to your body.'
  };

  trainer3 = {
    nickName: 'Ethan',
    name: 'Ethan Blake',
    role: 'Kettlebell Specialist',
    image: 'assets/images/trainers/daniel.webp',
    modalImage: 'assets/images/trainers/modal/daniel.webp',  
    bio: 'Ethan is a specialist in kettlebell technique. His training style is powerful, rhythmic, and technically precise.'
  };

  trainerY = {
    nickName: 'Lara',
    name: 'Lara Quinn',
    role: 'Dance Workout',
    image: 'assets/images/trainers/lara.webp',
    modalImage: 'assets/images/trainers/modal/lara.webp',  
    bio: 'Lara brings the joy of movement to every session. Her classes are energetic, uplifting, and full of positive vibes.'
  };

    trainer4 = {
    nickName: 'Sophie',
    name: 'Sophie Keller',
    role: 'Yoga Flow',
    image: 'assets/images/trainers/sophie.webp',
    modalImage: 'assets/images/trainers/modal/sophie.webp',  
    bio: 'Sophie blends breath and movement into a harmonious flow. Her sessions are calm, grounding, and deeply energizing.'
  };

  // MODAL STATE
  selectedTrainer: any = null;

  openTrainerModal(trainer: any) {
    this.selectedTrainer = trainer;
  }

  closeTrainerModal() {
    this.selectedTrainer = null;
  }
}
