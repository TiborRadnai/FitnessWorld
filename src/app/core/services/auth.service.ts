import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  User
} from 'firebase/auth';

import { auth as firebaseAuth } from '../../firebase';
import { db } from '../../firebase';
import { doc, setDoc } from 'firebase/firestore';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private auth = firebaseAuth;
  private userSubject = new BehaviorSubject<User | null>(null);
  user$ = this.userSubject.asObservable();

  constructor() {
    onAuthStateChanged(this.auth, (user) => {
      this.userSubject.next(user);
    });
  }

  // 🔥 REGISZTRÁCIÓ FULL NAME + NICKNAME
  async register(email: string, password: string, fullName: string, nickname: string) {
    const cred = await createUserWithEmailAndPassword(this.auth, email, password);

    // Firebase Auth displayName = nickname
    await updateProfile(cred.user, {
      displayName: nickname
    });

    // Firestore user dokumentum
    await setDoc(doc(db, "users", cred.user.uid), {
      fullName,
      nickname,
      email,
      createdAt: Date.now()
    });

    return cred;
  }

  login(email: string, password: string) {
    return signInWithEmailAndPassword(this.auth, email, password);
  }

  logout() {
    return signOut(this.auth);
  }

  get currentUser() {
    return this.userSubject.value;
  }
}
