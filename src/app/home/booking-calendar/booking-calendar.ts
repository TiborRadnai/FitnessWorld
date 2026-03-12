import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FirestoreService } from '../../core/services/firestore.service';
import { AuthService } from '../../core/services/auth.service';
import { OnInit } from '@angular/core';
import { Booking } from '../../core/models/booking.model';

@Component({
  selector: 'app-booking-calendar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './booking-calendar.html',
  styleUrl: './booking-calendar.css',
})
export class BookingCalendar implements OnInit {

  services = [
    { id: 'strength', name: 'Strength Training', color: '#ff006e' },
    { id: 'yoga', name: 'Yoga Flow', color: '#8338ec' },
    { id: 'kettlebell', name: 'Kettlebell Workouts', color: '#3a86ff' },
    { id: 'hiit', name: 'HIIT Training', color: '#fb5607' },
    { id: 'functional', name: 'Functional Training', color: '#ffbe0b' },
    { id: 'dance', name: 'Dance Workout Energy', color: '#ff0099' },
  ];

  currentYear = new Date().getFullYear();
  currentMonth = new Date().getMonth(); 
  monthName = '';
  calendarDays: any[] = [];
  hoverInfo: any = null;
  bookingStep: 'list' | 'form' | 'success' = 'list';
  selectedTraining: any = null;
  showSidebar = false;
  bookings: Booking[] = [];
  myBookings: Booking[] = [];


  constructor(
    private fs: FirestoreService,
    private auth: AuthService
  ) {
    this.generateCalendar();
  }

  ngOnInit() {
    this.auth.user$.subscribe(user => {
      if (user) {
        this.loadBookings();
      }
    });
  }

  async loadBookings() {
    const user = this.auth.currentUser;
    if (!user) return;

    const all = await this.fs.getUserBookings(user.uid);
    this.bookings = all;
    this.myBookings = all;

    this.calendarDays.forEach(day => {
      const bookingsForDay = all.filter(b => b.date === day.date && b.month === this.monthName);

      day.hasBooking = bookingsForDay.length > 0;
      day.userHasBooking = bookingsForDay.length > 0;
    });
  }

  weeklySchedule = {
    monday: [
      { serviceId: 'strength', time: '09:00' },
      { serviceId: 'yoga', time: '11:00' },
      { serviceId: 'hiit', time: '17:00' },
      { serviceId: 'functional', time: '19:00' },
    ],
    tuesday: [
      { serviceId: 'dance', time: '10:00' },
      { serviceId: 'kettlebell', time: '12:00' },
      { serviceId: 'strength', time: '18:00' },
      { serviceId: 'yoga', time: '20:00' },
    ],
    wednesday: [
      { serviceId: 'hiit', time: '09:00' },
      { serviceId: 'functional', time: '11:00' },
      { serviceId: 'kettlebell', time: '17:00' },
      { serviceId: 'dance', time: '19:00' },
    ],
    thursday: [
      { serviceId: 'yoga', time: '10:00' },
      { serviceId: 'strength', time: '12:00' },
      { serviceId: 'hiit', time: '18:00' },
      { serviceId: 'functional', time: '20:00' },
    ],
    friday: [
      { serviceId: 'kettlebell', time: '09:00' },
      { serviceId: 'dance', time: '11:00' },
      { serviceId: 'strength', time: '17:00' },
      { serviceId: 'yoga', time: '19:00' },
    ],
    saturday: [
      { serviceId: 'functional', time: '10:00' },
      { serviceId: 'hiit', time: '12:00' },
      { serviceId: 'kettlebell', time: '14:00' },
    ],
    sunday: [
      { serviceId: 'yoga', time: '10:00' },
      { serviceId: 'dance', time: '12:00' },
      { serviceId: 'strength', time: '16:00' },
    ],
  };

  generateCalendar() {
    const date = new Date(this.currentYear, this.currentMonth, 1);

    this.monthName = date.toLocaleString('en-US', { month: 'long', year: 'numeric' });

    const daysInMonth = new Date(this.currentYear, this.currentMonth + 1, 0).getDate();

    this.calendarDays = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(this.currentYear, this.currentMonth, day);
      const weekday = currentDate
        .toLocaleString('en-US', { weekday: 'long' })
        .toLowerCase()
        .trim();

      const trainingsForDay =
        this.weeklySchedule[weekday as keyof typeof this.weeklySchedule] || [];

      const mappedTrainings = trainingsForDay.map((t: any) => {
        const service = this.services.find(s => s.id === t.serviceId);
        return {
          name: service?.name || '',
          color: service?.color || '#fff',
          time: t.time
        };
      });


      this.calendarDays.push({
        date: day,
        trainings: mappedTrainings,
        hasBooking: false,
        userHasBooking: false
      });
    }
  }

  prevMonth() {
    if (this.currentMonth === 0) {
      this.currentMonth = 11;
      this.currentYear--;
    } else {
      this.currentMonth--;
    }
    this.generateCalendar();
    this.loadBookings();
  }

  nextMonth() {
    if (this.currentMonth === 11) {
      this.currentMonth = 0;
      this.currentYear++;
    } else {
      this.currentMonth++;
    }
    this.generateCalendar();
    this.loadBookings(); 
  }

  previewService(service: any) {}
  clearPreview() {}
  selectService(service: any) {}
  showDayInfo(event: MouseEvent, day: any) {
    this.hoverInfo = {
      x: event.clientX + 15,
      y: event.clientY + 15,
      date: day.date,
      trainings: day.trainings,
      hasBooking: day.hasBooking,
      userHasBooking: day.userHasBooking
    };
  }

  hideDayInfo() {
    this.hoverInfo = null;
  }

  selectedDay: any = null;

  openDay(day: any) {
    this.selectedDay = {
      ...day,
      userHasBooking: day.userHasBooking,  
      trainings: day.trainings.map((t: any) => ({
        ...t,
        capacity: t.capacity ?? 12,
        booked: t.booked ?? 0,
        freeSpots: t.freeSpots ?? 12,
        isBooked: t.isBooked ?? false
      }))
    };
  }

  closeModal() {
    this.selectedDay = null;
    this.selectedTraining = null;
    this.bookingStep = 'list';
  }

  startBooking(training: any) {
    if (!this.auth.currentUser) {
      alert('Please log in or register to book a training.');
      return;
    }

    this.selectedTraining = training;
    this.bookingStep = 'form';
  }

  async confirmBooking() {
    const user = this.auth.currentUser;
    if (!user) return;

    const booking: Booking = {
      userId: user.uid,
      userName: user.displayName || '',
      userEmail: user.email || '',
      date: this.selectedDay.date,
      month: this.monthName,
      name: this.selectedTraining.name,
      time: this.selectedTraining.time,
      createdAt: Date.now()
    };

    try {
      await this.fs.addBooking(user.uid, booking);
    } catch (err) {
      console.error('[BookingCalendar] Firestore error:', err);
    }

    this.bookings.push(booking);
    this.myBookings = this.bookings.filter(b => b.userId === user.uid);


    this.selectedTraining.booked++;
    this.selectedTraining.freeSpots--;
    this.selectedTraining.isBooked = true;

   const day = this.calendarDays.find(d => d.date === this.selectedDay.date);
    if (day) {
      day.hasBooking = true;
      day.userHasBooking = true;
    }

    this.bookingStep = 'success';
  }
}
