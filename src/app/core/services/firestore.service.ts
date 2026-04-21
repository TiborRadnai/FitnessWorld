import { Injectable } from '@angular/core';
import { db } from '../../firebase';
import {
  collection,
  addDoc,
  getDocs,
  setDoc,          
  query,
  where,
  doc,
  updateDoc,
  deleteDoc,
  increment,
  onSnapshot
} from 'firebase/firestore';

import { Booking } from '../models/booking.model';
import { Product } from '../models/product';


@Injectable({ providedIn: 'root' })
export class FirestoreService {

  // -------------------------
  // BOOKING FUNKCIÓK
  // -------------------------

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

  // -------------------------
  // WEBSHOP: TERMÉKEK
  // -------------------------

  async getProducts(): Promise<Product[]> {
    const ref = collection(db, 'products');
    const snap = await getDocs(ref);
    return snap.docs.map(d => ({ id: d.id, ...d.data() })) as Product[];
  }

  async addProduct(data: Product) {
    const ref = collection(db, 'products');
    return await addDoc(ref, data);
  }

  async updateProduct(productId: string, data: Partial<Product>) {
    const ref = doc(db, 'products', productId);
    return await updateDoc(ref, data as any);
  }

  async deleteProduct(productId: string) {
    const ref = doc(db, 'products', productId);
    return await deleteDoc(ref);
  }

  async decreaseStock(productId: string, quantity: number) {
    const ref = doc(db, `products/${productId}`);

    await updateDoc(ref, {
      stock: increment(-quantity)
    });
  }

  async addToUserCart(userId: string, product: Product) {
  const ref = doc(db, `users/${userId}/cart/${product.id}`);

  await updateDoc(ref, {
    id: product.id,
    name: product.name,
    price: product.price,
    imageUrl: product.imageUrl,
    quantity: increment(1)
  }).catch(async () => {
    // Ha még nincs ilyen dokumentum, létrehozzuk quantity = 1-gyel
    await setDoc(ref, {
      id: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
      quantity: 1
    });
  });
}

getUserCart(userId: string, callback: (items: any[]) => void) {
  const ref = collection(db, `users/${userId}/cart`);

  return onSnapshot(ref, (snapshot) => {
    const items = snapshot.docs.map(d => ({
      id: d.id,
      ...d.data()
    }));
    callback(items);
  });
}

// -------------------------
// WEBSHOP: RENDELÉSEK
// -------------------------

async createOrder(userId: string, data: any) {
  const ref = collection(db, `users/${userId}/orders`);
  const docRef = await addDoc(ref, {
    ...data,
    createdAt: new Date()
  });
  return docRef.id; // visszaadjuk az order ID-t
}

async addOrderItem(userId: string, orderId: string, item: any) {
  const ref = doc(db, `users/${userId}/orders/${orderId}/items/${item.id}`);
  return await setDoc(ref, item);
}

async clearUserCart(userId: string) {
  const ref = collection(db, `users/${userId}/cart`);
  const snap = await getDocs(ref);

  const deletions = snap.docs.map(d =>
    deleteDoc(doc(db, `users/${userId}/cart/${d.id}`))
  );

  return Promise.all(deletions);
}

async getUserCartOnce(userId: string): Promise<any[]> {
  const ref = collection(db, `users/${userId}/cart`);
  const snap = await getDocs(ref);
  return snap.docs.map(d => ({
    id: d.id,
    ...d.data()
  }));
}

}
