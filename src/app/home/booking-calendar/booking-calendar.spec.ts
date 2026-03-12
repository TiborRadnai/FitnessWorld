import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BookingCalendar } from './booking-calendar';

describe('BookingCalendar', () => {
  let component: BookingCalendar;
  let fixture: ComponentFixture<BookingCalendar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookingCalendar]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BookingCalendar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
