import { Component, computed, signal, effect } from '@angular/core';
import { CommonModule, NgIf, NgFor } from '@angular/common';
import { collection, collectionGroup, onSnapshot, getDocs } from 'firebase/firestore';
import { db } from '../../../firebase';
import { Product } from '../../../types/product';
import { Chart } from 'chart.js/auto';

@Component({
  selector: 'admin-dashboard',
  standalone: true,
  imports: [CommonModule, NgIf, NgFor],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard {

  products = signal<Product[]>([]);
  orders = signal<any[]>([]);
  selectedOrder = signal<any | null>(null);
  orderItems = signal<any[]>([]);
  isOrderModalOpen = signal(false);

  private userMap = new Map<string, string>();
  private chart: Chart | null = null;
  private userOrdersMap = new Map<string, any[]>();

  constructor() {
    this.listenToUsers();
    this.listenToProducts();
    this.listenToOrders();

    effect(() => {
      const data = this.dailyRevenue();
      if (!data.length) return;

      const canvas = document.getElementById('revenueChart') as HTMLCanvasElement | null;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      if (this.chart) this.chart.destroy();

      this.chart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: data.map(d => d.day),
          datasets: [{
            data: data.map(d => d.total),
            borderColor: '#ff2bd4',
            backgroundColor: 'rgba(255, 43, 212, 0.2)',
            tension: 0.3
          }]
        },
        options: {
          plugins: { legend: { display: false } },
          scales: {
            x: { ticks: { color: '#ccc' } },
            y: { ticks: { color: '#ccc' } }
          }
        }
      });
    });
  }

  // -----------------------------
  // REALTIME USERS
  // -----------------------------
  listenToUsers() {
    onSnapshot(collection(db, 'users'), snap => {
      this.userMap.clear();
      snap.forEach(doc => {
        const data = doc.data() as any;
        this.userMap.set(doc.id, data.fullName || data.nickname || data.email);
      });
    });
  }

  // -----------------------------
  // REALTIME PRODUCTS
  // -----------------------------
  listenToProducts() {
    onSnapshot(collection(db, 'products'), snap => {
      const products: Product[] = snap.docs.map(d => {
        const data = d.data() as any;
        return {
          id: d.id,
          name: data.name ?? 'Unnamed product',
          price: data.price ?? 0,
          stock: data.stock ?? 0
        };
      });
      this.products.set(products);
    });
  }

  // -----------------------------
  // REALTIME ORDERS
  // -----------------------------
listenToOrders() {
  // FIGYELJÜK A USERS KOLLEKCIÓT
  onSnapshot(collection(db, 'users'), usersSnap => {
    // új users snapshot → nem töröljük a map-et, csak új usereknél adunk hozzá listenert
    usersSnap.forEach(userDoc => {
      const userId = userDoc.id;

      if (this.userOrdersMap.has(userId)) {
        // már van listener ehhez a userhez
        return;
      }

      const ordersRef = collection(db, `users/${userId}/orders`);

      onSnapshot(ordersRef, async ordersSnap => {
        const userOrders: any[] = [];

        for (const d of ordersSnap.docs) {
          const data = d.data();

          const itemsSnap = await getDocs(
            collection(db, `users/${userId}/orders/${d.id}/items`)
          );

          const items = itemsSnap.docs.map(i => ({
            id: i.id,
            ...i.data()
          }));

          userOrders.push({
            id: d.id,
            userId,
            customerName: this.userMap.get(userId) || userId,
            ...data,
            status: data['status'] ?? 'completed',
            items
          });
        }

        // user saját rendelései frissülnek
        this.userOrdersMap.set(userId, userOrders);

        // MINDEN USER RENDELÉSÉNEK ÚJRAÖSSZEGYŰJTÉSE
        const allOrders: any[] = [];
        this.userOrdersMap.forEach(list => allOrders.push(...list));

        this.orders.set(allOrders);
      });
    });
  });
}


  // -----------------------------
  // HELPERS
  // -----------------------------
  formatDate(value: any) {
    if (!value) return null;
    const date = value.toDate ? value.toDate() : new Date(value);
    return date;
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

  lowStockProducts = computed(() => {
    return this.products().filter(p => (p.stock as number) < 5);
  });

  async openOrder(order: any) {
    this.selectedOrder.set(order);
    this.isOrderModalOpen.set(true);

    const itemsSnap = await getDocs(
      collection(db, `users/${order.userId}/orders/${order.id}/items`)
    );

    this.orderItems.set(
      itemsSnap.docs.map(d => ({ id: d.id, ...d.data() }))
    );
  }

  sortedOrders = computed(() => {
    return [...this.orders()].sort((a, b) => {
      const da = (a.createdAt?.toDate?.() ?? new Date(a.createdAt)).getTime();
      const db = (b.createdAt?.toDate?.() ?? new Date(b.createdAt)).getTime();
      return db - da; // 🔥 legfrissebb elöl
    });
  });

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
      o.items.forEach((item: any) => {
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
