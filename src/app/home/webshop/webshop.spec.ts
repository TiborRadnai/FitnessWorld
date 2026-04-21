import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Webshop } from './webshop';

describe('Webshop', () => {
  let component: Webshop;
  let fixture: ComponentFixture<Webshop>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Webshop]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Webshop);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
