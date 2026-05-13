import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FirestoreService } from '../../../core/services/firestore.service';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './users.html',
  styleUrl: './users.css'
})
export class Users implements OnInit {

  users = signal<any[]>([]);
  expandedUserId = signal<string | null>(null);

  constructor(private firestore: FirestoreService) {}

  async ngOnInit() {
    await this.loadUsers();
  }

  async loadUsers() {
    const rawUsers = await this.firestore.getUsers();

    const list = await Promise.all(
      rawUsers.map(async (u: any) => {
        const orders = await this.firestore.getOrdersForUser(u.id);

        const totalSpent = orders.reduce((sum, o) => sum + (o.total || 0), 0);

        const lastOrderDate = orders.length
          ? orders
              .map(o => o.createdAt?.toDate?.() || new Date(o.createdAt))
              .sort((a, b) => b.getTime() - a.getTime())[0]
          : null;

        return {
          id: u.id,
          fullName: u.fullName,
          nickname: u.nickname,
          email: u.email,
          createdAt: u.createdAt?.toDate?.() || new Date(u.createdAt),
          ordersCount: orders.length,
          totalSpent,
          lastOrder: lastOrderDate,
          rank: this.getRank(orders.length),
          orders
        };
      })
    );

    this.users.set(
      list.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    );
  }

  getRank(count: number) {
    if (count >= 15) return 'gold';
    if (count >= 10) return 'silver';
    if (count >= 5) return 'bronze';
    return 'none';
  }

  formatDate(date: any) {
    if (!date) return '–';
    const d = date instanceof Date ? date : (date.toDate ? date.toDate() : new Date(date));
    return d.toLocaleDateString('de-DE');
  }

  toggleUser(id: string) {
    this.expandedUserId.set(
      this.expandedUserId() === id ? null : id
    );
  }
}
