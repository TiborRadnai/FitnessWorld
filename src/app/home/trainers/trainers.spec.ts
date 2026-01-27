import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Trainers } from './trainers';

describe('Trainers', () => {
  let component: Trainers;
  let fixture: ComponentFixture<Trainers>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Trainers]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Trainers);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
