import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalesOverview } from './sales-overview';

describe('SalesOverview', () => {
  let component: SalesOverview;
  let fixture: ComponentFixture<SalesOverview>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SalesOverview]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SalesOverview);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
