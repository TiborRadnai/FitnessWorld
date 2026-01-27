import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuoteBlock } from './quote-block';

describe('QuoteBlock', () => {
  let component: QuoteBlock;
  let fixture: ComponentFixture<QuoteBlock>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuoteBlock]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuoteBlock);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
