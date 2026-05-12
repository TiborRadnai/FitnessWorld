import { Injectable } from '@angular/core';
import { db } from '../../firebase';
import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  setDoc,
  query,
  where,
  doc,
  updateDoc,
  deleteDoc,
  onSnapshot
} from 'firebase/firestore';

import { Booking } from '../models/booking.model';
import { Product } from '../models/product';
import { getStorage, ref, uploadBytes, listAll, getDownloadURL } from 'firebase/storage';

const storage = getStorage();

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

  async getProduct(productId: string): Promise<Product | null> {
    const ref = doc(db, `products/${productId}`);
    const snap = await getDoc(ref);

    if (!snap.exists()) return null;

    const data = snap.data() as Omit<Product, 'id'>;
    return { id: snap.id, ...data };
  }

  async getProducts(): Promise<Product[]> {
    const ref = collection(db, 'products');
    const snap = await getDocs(ref);

    return snap.docs.map(d => {
      const data = d.data() as Omit<Product, 'id'>;
      return { id: d.id, ...data };
    });
  }

  async addProduct(data: Partial<Product>) {
    const { id, ...rest } = data;
    const ref = collection(db, 'products');
    return await addDoc(ref, rest);
  }

  async updateProduct(productId: string, data: Partial<Product>) {
    const { id, ...rest } = data;
    const ref = doc(db, 'products', productId);
    return await updateDoc(ref, rest as any);
  }

  async deleteProduct(productId: string) {
    const ref = doc(db, 'products', productId);
    return await deleteDoc(ref);
  }

  // 🔥 SOHA NEM MEGY MINUSZBA
  async decreaseStock(productId: string, quantity: number) {
    const ref = doc(db, `products/${productId}`);
    const snap = await getDoc(ref);

    if (!snap.exists()) return;

    const data = snap.data() as any;
    const current = data.stock ?? 0;

    const newStock = Math.max(0, current - quantity);

    await updateDoc(ref, { stock: newStock });
  }

  // -------------------------
  // WEBSHOP: KOSÁR
  // -------------------------

  async addToUserCart(userId: string, product: Product) {
    const ref = doc(db, `users/${userId}/cart/${product.id}`);
    const snap = await getDoc(ref);

    if (snap.exists()) {
      // 🔥 már van ilyen termék → quantity növelése
      const current = snap.data() as any;
      const newQty = (current.quantity || 1) + 1;

      await updateDoc(ref, {
        quantity: newQty
      });

    } else {
      // 🔥 új termék → quantity = 1
      await setDoc(ref, {
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        category: product.category
      });
    }
  }

  getUserCart(userId: string, callback: (items: any[]) => void) {
    const ref = collection(db, `users/${userId}/cart`);

    return onSnapshot(ref, (snapshot) => {
      const items = snapshot.docs.map(d => {
        const data = d.data() as any;
        return {
          id: d.id,            // cart item ID
          productId: data.productId, // valódi termék ID
          ...data
        };
      });
      callback(items);
    });
  }

  async getUserCartOnce(userId: string): Promise<any[]> {
    const ref = collection(db, `users/${userId}/cart`);
    const snap = await getDocs(ref);

    return snap.docs.map(d => {
      const data = d.data() as any;
      return {
        id: d.id,
        productId: data.productId,
        ...data
      };
    });
  }

  // -------------------------
  // WEBSHOP: RENDELÉSEK
  // -------------------------

  async createOrder(userId: string, data: any) {
    const ref = collection(db, `users/${userId}/orders`);
    const docRef = await addDoc(ref, {
      total: data.total,
      items: data.items,
      status: 'completed',
      createdAt: new Date()
    });
    return docRef.id;
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

  // -------------------------
  // STORAGE: KÉPEK
  // -------------------------

  async listImages(): Promise<{ name: string, url: string }[]> {
    const folderRef = ref(storage, 'products');
    const result = await listAll(folderRef);

    const files = await Promise.all(
      result.items.map(async item => {
        const url = await getDownloadURL(item);
        return { name: item.name, url };
      })
    );

    return files;
  }

  async uploadImage(file: File): Promise<string> {
    const fileRef = ref(storage, `products/${file.name}`);
    await uploadBytes(fileRef, file);
    return file.name; // fontos: a fájl neve marad
  }

  async getImageUrl(fileName: string): Promise<string> {
    const fileRef = ref(storage, `products/${fileName}`);
    return await getDownloadURL(fileRef);
  }

  async getAllOrders(): Promise<any[]> {
    const usersRef = collection(db, 'users');
    const usersSnap = await getDocs(usersRef);

    let allOrders: any[] = [];

    for (const user of usersSnap.docs) {
      const ordersRef = collection(db, `users/${user.id}/orders`);
      const ordersSnap = await getDocs(ordersRef);

      const orders = ordersSnap.docs.map(d => ({
        id: d.id,
        userId: user.id,
        ...d.data()
      }));

      allOrders = [...allOrders, ...orders];
    }

    return allOrders;
  }
}
