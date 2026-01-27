import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-quote-block',
  standalone: true,
  templateUrl: './quote-block.html',
  styleUrl: './quote-block.css'
})
export class QuoteBlock {
  @Input() text: string = '';
  @Input() author: string = '';
}
