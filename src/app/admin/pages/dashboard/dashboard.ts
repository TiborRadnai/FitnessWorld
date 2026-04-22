import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';   // <-- EZ KELL
import { collection, collectionGroup, getDocs } from 'firebase/firestore';
import { db } from '../../../firebase';
import { Product } from '../../../types/product';
import { getAuth, signInAnonymously } from 'firebase/auth';

@Component({
  selector: 'admin-dashboard',
  standalone: true,
  imports: [CommonModule],   // <-- IDE IS KELL
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})

export class Dashboard {

  products = signal<Product[]>([]);
  orders = signal<any[]>([]);
  selectedOrder = signal<any | null>(null);
  orderItems = signal<any[]>([]);
  isOrderModalOpen = signal(false);

  constructor() {
    const auth = getAuth();
    signInAnonymously(auth);
    this.loadData();
  }

  async loadData() {
    // USERS → map userId → fullName
    const usersSnap = await getDocs(collection(db, 'users'));
    const userMap = new Map<string, string>();
    usersSnap.forEach(doc => {
      const data = doc.data() as any;
      userMap.set(doc.id, data.fullName || data.nickname || data.email);
    });

    // PRODUCTS
    const productsSnap = await getDocs(collection(db, 'products'));
    this.products.set(
      productsSnap.docs.map(d => ({ id: d.id, ...d.data() } as Product))
    );

    // ORDERS – MINDEN USER ALÓL
    const ordersSnap = await getDocs(collectionGroup(db, 'orders'));
    this.orders.set(
      ordersSnap.docs.map(d => {
        const data = d.data();
        const userId = d.ref.parent.parent?.id || '';

        return {
          id: d.id,
          userId,
          customerName: userMap.get(userId) || userId,
          ...data,
          status: data['status'] ?? 'completed' 
        };
      })
    );
  }

  totalOrders = computed(() => this.orders().length);

  todaysOrders = computed(() => {
    const today = new Date().toISOString().slice(0, 10);
    return this.orders().filter(o => {
      const date = (o.createdAt as any)?.toDate?.() ?? o.createdAt;
      if (!date) return false;
      const iso = (date instanceof Date ? date : new Date(date)).toISOString().slice(0, 10);
      return iso === today;
    }).length;
  });

  totalRevenue = computed(() => {
    return this.orders().reduce((sum, o) => sum + (o.total || 0), 0);
  });

  lowStock = computed(() => {
    return this.products().filter(p => (p.stock as number) < 5).length;
  });

  async openOrder(order: any) {
    this.selectedOrder.set(order);
    this.isOrderModalOpen.set(true);

    // ITEMS lekérése Firestore-ból
    const itemsSnap = await getDocs(
      collection(db, `users/${order.userId}/orders/${order.id}/items`)
    );

    this.orderItems.set(
      itemsSnap.docs.map(d => ({ id: d.id, ...d.data() }))
    );
  }

  closeOrder() {
    this.isOrderModalOpen.set(false);
    this.selectedOrder.set(null);
    this.orderItems.set([]);
  }

  dailyRevenue = computed(() => {
    const map = new Map<string, number>();

    this.orders().forEach(o => {
      const raw = (o.createdAt as any)?.toDate?.() ?? o.createdAt;
      if (!raw) return;

      const date = raw instanceof Date ? raw : new Date(raw);
      const day = date.toISOString().slice(0, 10);

      map.set(day, (map.get(day) || 0) + (o.total || 0));
    });

    return Array.from(map.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([day, total]) => ({ day, total }));
  });

  topProducts = computed(() => {
    const map = new Map<string, { name: string; qty: number; revenue: number }>();

    this.orders().forEach(o => {
      (o.items || []).forEach((item: any) => {
        if (!map.has(item.id)) {
          map.set(item.id, { name: item.name, qty: 0, revenue: 0 });
        }
        const entry = map.get(item.id)!;
        entry.qty += item.quantity;
        entry.revenue += item.quantity * item.price;
      });
    });

    return Array.from(map.values())
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);
  });
}
