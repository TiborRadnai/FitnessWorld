import { Component, OnInit } from '@angular/core';
import { Header } from './header/header';
import { Services } from './services/services';
import { Trainers } from './trainers/trainers';
import { QuoteBlock } from './quote-block/quote-block';
import { BookingCalendar } from './booking-calendar/booking-calendar';
import { Webshop } from './webshop/webshop';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [Header, Services, Trainers, QuoteBlock, BookingCalendar, Webshop],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home implements OnInit {

  ngOnInit() {
    // ❌ SEMMI success/canceled logika ide
  }
}
