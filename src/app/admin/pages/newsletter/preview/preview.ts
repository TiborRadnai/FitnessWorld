import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-newsletter-preview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './preview.html',
  styleUrls: ['./preview.css']
})
export class NewsletterPreview {
  @Input() html = '';
  @Output() close = new EventEmitter<void>();
  safeHtml: SafeHtml = '';

  constructor(private sanitizer: DomSanitizer) {}

  ngOnChanges() {
    this.safeHtml = this.sanitizer.bypassSecurityTrustHtml(this.html || '');
  }
}
