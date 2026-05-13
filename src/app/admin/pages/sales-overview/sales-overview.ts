import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FirestoreService } from '../../../core/services/firestore.service';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-sales-overview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sales-overview.html',
  styleUrl: './sales-overview.css'
})
export class SalesOverview implements OnInit {

  totalRevenue = signal(0);
  totalOrders = signal(0);
  totalItemsSold = signal(0);
  averageOrderValue = signal(0);
  activeFilter = signal<'today' | '7' | '30' | 'thisMonth' | 'lastMonth' | 'thisYear' | null>(null);
  
  revenueChart: any;
  ordersChart: any;

  orders: any[] = [];
  products: any[] = [];
  categoriesChart: any;
  expandedOrderId = signal<string | null>(null);
  allProducts = signal<
    { productId: string; name: string; totalSold: number; revenue: number }[]
  >([]);

  categories = signal<
    { category: string; totalSold: number; revenue: number }[]
  >([]);

  constructor(private firestore: FirestoreService) {}

  async ngOnInit() {
    await this.loadProducts();
    await this.loadOrders();
    this.calculateStats();
    this.calculateAllProducts();
    this.calculateCategories();
    this.buildRevenueChart();
    this.buildOrdersChart();
    this.buildCategoriesChart();
  }

  async loadProducts() {
    this.products = await this.firestore.getProducts();
  }

  async loadOrders() {
    const rawOrders = await this.firestore.getAllOrders();

    const enrichedOrders = await Promise.all(
      rawOrders.map(async (o: any) => {
        const user = await this.firestore.getUserData(o.userId);
        return {
          ...o,
          customerName: user?.fullName || 'N/A',
          customerEmail: user?.email || 'N/A'
        };
      })
    );

    this.orders = enrichedOrders.sort((a, b) => {
      const da = a.createdAt.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
      const db = b.createdAt.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
      return db.getTime() - da.getTime(); // 🔥 legújabb elöl
    });
  }

  toggleOrder(id: string) {
    this.expandedOrderId.set(
      this.expandedOrderId() === id ? null : id
    );
  }

  calculateStats() {
    const orders = this.orders;

    const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
    const totalItems = orders.reduce((sum, o) => {
      return sum + (o.items?.reduce((s: number, i: any) => s + i.quantity, 0) || 0);
    }, 0);

    this.totalRevenue.set(totalRevenue);
    this.totalOrders.set(orders.length);
    this.totalItemsSold.set(totalItems);
    this.averageOrderValue.set(orders.length ? totalRevenue / orders.length : 0);
  }

  // 🔥 TOP PRODUCTS AGGREGÁLÁS
  calculateAllProducts() {
    // 1) Eladási statok map-be (productId -> { totalSold, revenue })
    const salesMap = new Map<string, { totalSold: number; revenue: number }>();

    for (const order of this.orders) {
      const items = order.items || [];
      for (const item of items) {
        const id = item.productId || item.id;
        if (!id) continue;

        const qty = item.quantity || 0;
        const price = item.price || 0;
        const revenue = qty * price;

        if (!salesMap.has(id)) {
          salesMap.set(id, { totalSold: qty, revenue });
        } else {
          const current = salesMap.get(id)!;
          current.totalSold += qty;
          current.revenue += revenue;
        }
      }
    }

    // 2) MINDEN product szerepeljen, akkor is, ha nincs a salesMap-ben
    const list = this.products.map(p => {
      const stats = salesMap.get(p.id) || { totalSold: 0, revenue: 0 };
      return {
        productId: p.id,
        name: p.name,
        totalSold: stats.totalSold,
        revenue: stats.revenue
      };
    });

    // 3) Rendezés bevétel szerint (de semmit nem vágunk le)
    list.sort((a, b) => b.revenue - a.revenue);

    this.allProducts.set(list);
  }

  buildRevenueChart() {
    const ctx = document.getElementById('revenueChart') as HTMLCanvasElement;

    const labels = this.orders.map(o => this.formatDate(o.createdAt));
    const data = this.orders.map(o => o.total);

    this.revenueChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Revenue (€)',
          data,
          borderColor: '#ec4899',
          backgroundColor: 'rgba(236, 72, 153, 0.2)',
          borderWidth: 2,
          tension: 0.3,
          fill: true
        }]
      },
      options: {
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { color: '#aaa' } },
          y: { ticks: { color: '#aaa' } }
        }
      }
    });
  }

  groupOrdersByDay(orders: any[]) {
    const map = new Map<string, number>();

    for (const o of orders) {
      const d = this.formatDate(o.createdAt); // pl. "13.05.2026"
      map.set(d, (map.get(d) || 0) + 1);
    }

    return {
      labels: Array.from(map.keys()),
      data: Array.from(map.values())
    };
  }

  buildOrdersChart() {
    const ctx = document.getElementById('ordersChart') as HTMLCanvasElement;

    const grouped = this.groupOrdersByDay(this.orders);

    this.ordersChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: grouped.labels,
        datasets: [{
          label: 'Orders',
          data: grouped.data,
          backgroundColor: 'rgba(59, 130, 246, 0.5)',
          borderColor: '#3b82f6',
          borderWidth: 1
        }]
      },
      options: {
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { color: '#aaa' } },
          y: { ticks: { color: '#aaa' } }
        }
      }
    });
  }

  formatDate(date: any) {
    if (!date) return '';
    const d = date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleDateString('de-DE');
  }

  calculateCategories() {
    const map = new Map<string, { totalSold: number; revenue: number }>();

    // 1) Végigmegyünk az összes order összes itemjén
    for (const order of this.orders) {
      const items = order.items || [];

      for (const item of items) {
        const category = item.category || 'Uncategorized';
        const qty = item.quantity || 0;
        const price = item.price || 0;
        const revenue = qty * price;

        if (!map.has(category)) {
          map.set(category, { totalSold: qty, revenue });
        } else {
          const current = map.get(category)!;
          current.totalSold += qty;
          current.revenue += revenue;
        }
      }
    }

    // 2) Minden kategória szerepeljen, akkor is, ha nincs eladás
    for (const p of this.products) {
      const category = p.category || 'Uncategorized';
      if (!map.has(category)) {
        map.set(category, { totalSold: 0, revenue: 0 });
      }
    }

    // 3) Átalakítjuk listává
    const list = Array.from(map.entries()).map(([category, v]) => ({
      category,
      totalSold: v.totalSold,
      revenue: v.revenue
    }));

    // 4) Bevétel szerint rendezzük
    list.sort((a, b) => b.revenue - a.revenue);

    this.categories.set(list);
  }


  buildCategoriesChart() {
    const ctx = document.getElementById('categoriesChart') as HTMLCanvasElement;

    const labels = this.categories().map(c => c.category);
    const data = this.categories().map(c => c.revenue);

    this.categoriesChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: [
            '#ec4899',
            '#3b82f6',
            '#10b981',
            '#f59e0b',
            '#8b5cf6',
            '#ef4444'
          ],
          borderWidth: 1
        }]
      },
      options: {
        plugins: {
          legend: {
            labels: { color: '#ccc' }
          }
        }
      }
    });
  }

  applyFilter(type: 'today' | '7' | '30' | 'thisMonth' | 'lastMonth' | 'thisYear') {
    this.activeFilter.set(type);

    const now = new Date();
    let start: Date | null = null;

    switch (type) {
      case 'today':
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;

      case '7':
        start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;

      case '30':
        start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;

      case 'thisMonth':
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        break;

      case 'lastMonth':
        start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        break;

      case 'thisYear':
        start = new Date(now.getFullYear(), 0, 1);
        break;
    }

    // 🔥 SZŰRT ORDEREK
    const filtered = start
      ? this.orders.filter(o => {
          const d = o.createdAt.toDate ? o.createdAt.toDate() : new Date(o.createdAt);
          return d >= start;
        })
      : this.orders;

    // 🔥 ÚJRA SZÁMOLJUK A STATOKAT
    this.calculateStatsFiltered(filtered);

    // 🔥 CHARTOK ÚJRAÉPÍTÉSE
    this.rebuildCharts(filtered);
  }

  calculateStatsFiltered(orders: any[]) {
    const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
    const totalItems = orders.reduce((sum, o) => {
      return sum + (o.items?.reduce((s: number, i: any) => s + i.quantity, 0) || 0);
    }, 0);

    this.totalRevenue.set(totalRevenue);
    this.totalOrders.set(orders.length);
    this.totalItemsSold.set(totalItems);
    this.averageOrderValue.set(orders.length ? totalRevenue / orders.length : 0);
  }

  rebuildCharts(orders: any[]) {
    if (this.revenueChart) this.revenueChart.destroy();
    if (this.ordersChart) this.ordersChart.destroy();

    // Revenue chart
    const ctx1 = document.getElementById('revenueChart') as HTMLCanvasElement;
    const revenueLabels = orders.map(o => this.formatDate(o.createdAt));
    const revenueData = orders.map(o => o.total);

    this.revenueChart = new Chart(ctx1, {
      type: 'line',
      data: {
        labels: revenueLabels,
        datasets: [{
          label: 'Revenue (€)',
          data: revenueData,
          borderColor: '#ec4899',
          backgroundColor: 'rgba(236, 72, 153, 0.2)',
          borderWidth: 2,
          tension: 0.3,
          fill: true
        }]
      }
    });

    // Orders chart (AGGREGÁLT!)
    const ctx2 = document.getElementById('ordersChart') as HTMLCanvasElement;
    const grouped = this.groupOrdersByDay(orders);

    this.ordersChart = new Chart(ctx2, {
      type: 'bar',
      data: {
        labels: grouped.labels,
        datasets: [{
          label: 'Orders',
          data: grouped.data,
          backgroundColor: 'rgba(59, 130, 246, 0.5)',
          borderColor: '#3b82f6',
          borderWidth: 1
        }]
      }
    });
  }

}
