import { Component, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NewsletterPreview } from './preview/preview';

declare const tinymce: any;

@Component({
  selector: 'app-newsletter',
  standalone: true,
  imports: [CommonModule, NewsletterPreview],
  templateUrl: './newsletter.html',
  styleUrls: ['./newsletter.css']
})
export class Newsletter implements AfterViewInit, OnDestroy {

  content = '';
  showPreview = false;

  ngAfterViewInit() {
tinymce.init({
  selector: '#editor',
  height: 400,
  menubar: false,
  plugins: 'link image lists code table advlist',
  toolbar: 'undo redo | styles | bold italic underline strikethrough | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image table | removeformat code',
  skin: 'oxide-dark',
  content_css: 'dark',

  // 🔥 Fájltallózás engedélyezése
  file_picker_types: 'image',
    file_picker_callback: (callback: any, value: any, meta: any) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';

      input.onchange = function () {
        const file = (this as HTMLInputElement).files![0];
        const reader = new FileReader();

        reader.onload = function () {
          const base64 = reader.result as string;
          callback(base64, { title: file.name });
        };

        reader.readAsDataURL(file);
      };

      input.click();
    },


    setup: (editor: any) => {
      editor.on('keyup change input', () => {
        this.content = editor.getContent();
      });
    }
  });

  }

  ngOnDestroy() {
    tinymce.remove();
  }

  openPreview() {
    this.showPreview = true;
  }

  closePreview() {
    this.showPreview = false;
  }

  sendNewsletter() {
  if (!this.content.trim()) {
    alert('A hírlevél tartalma üres — előbb írj valamit!');
    return;
  }

  // Itt jöhetne az API‑hívás vagy a Firestore mentés
  console.log('Hírlevél elküldve:', this.content);

  alert('✅ Hírlevél sikeresen elküldve!');
}

}
