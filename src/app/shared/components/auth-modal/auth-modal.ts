import { Component, EventEmitter, Output } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-auth-modal',
  standalone: true,
  imports: [NgIf, FormsModule],
  templateUrl: './auth-modal.html',
  styleUrl: './auth-modal.css',
})

export class AuthModal {

  @Output() close = new EventEmitter<void>();

  mode: 'login' | 'register' = 'login';

  email = '';
  password = '';
  errorMessage = '';
  fullName = '';
  nickname = '';

  constructor(private auth: AuthService) {}

  switchToLogin() {
    this.mode = 'login';
    this.errorMessage = '';
  }

  switchToRegister() {
      console.log('SWITCH REGISTER');
    this.mode = 'register';
    this.errorMessage = '';
  }

  async submit() {
      if (!this.email || !this.password || (this.mode === 'register' && !this.nickname)) {
    this.errorMessage = 'All fields are required.';
    return;
  }

    try {
      if (this.mode === 'login') {
        await this.auth.login(this.email, this.password);
      } else {
        this.auth.register(this.email, this.password, this.fullName, this.nickname);
      }

      this.close.emit();

} catch (err: any) {
  const code = err.code;

  switch (code) {
    case 'auth/email-already-in-use':
      this.errorMessage = 'This email is already in use.';
      break;

    case 'auth/invalid-email':
      this.errorMessage = 'Please enter a valid email address.';
      break;

    case 'auth/weak-password':
      this.errorMessage = 'Your password is too weak.';
      break;

    case 'auth/user-not-found':
      this.errorMessage = 'No account found with this email.';
      break;

    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      this.errorMessage = 'Incorrect email or password.';
      break;

    default:
      this.errorMessage = 'Something went wrong. Please try again.';
  }
}

  }

  closeModal() {
    this.close.emit();
  }
}

