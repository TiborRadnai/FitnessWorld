import { Component } from '@angular/core';
import { Header } from './header/header';
import { Services } from './services/services';
import { Trainers } from './trainers/trainers';
import { QuoteBlock } from './quote-block/quote-block';
import { BookingCalendar } from './booking-calendar/booking-calendar';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [Header, Services, Trainers, QuoteBlock, BookingCalendar ],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home {}
