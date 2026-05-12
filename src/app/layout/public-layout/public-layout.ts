import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from '../../shared/navbar/navbar';
import { Footer } from '../../shared/footer/footer';
import { BackToTop } from '../../shared/back-to-top/back-to-top';

@Component({
  selector: 'app-public-layout',
  standalone: true,
  imports: [RouterOutlet, Navbar, Footer, BackToTop],
  templateUrl: './public-layout.html',
  styleUrl: './public-layout.css'
})
export class PublicLayout {}

