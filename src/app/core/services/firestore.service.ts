import { Injectable } from '@angular/core';
import { db } from '../../firebase';
import {
  collection,
  addDoc,
  getDocs,
  query,
  where
} from 'firebase/firestore';
import { Booking } from '../models/booking.model';

@Injectable({ providedIn: 'root' })
export class FirestoreService {

  async addBooking(userId: string, data: Booking) {
    const ref = collection(db, `users/${userId}/bookings`);
    return await addDoc(ref, data);
  }

  async getUserBookings(userId: string): Promise<Booking[]> {
    const ref = collection(db, `users/${userId}/bookings`);
    const snap = await getDocs(ref);
    return snap.docs.map(d => ({ id: d.id, ...d.data() })) as Booking[];
  }

  async getBookingsForDay(userId: string, date: number, month: string) {
    const ref = collection(db, `users/${userId}/bookings`);
    const q = query(
      ref,
      where('date', '==', date),
      where('month', '==', month)
    );

    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() })) as Booking[];
  }

}
