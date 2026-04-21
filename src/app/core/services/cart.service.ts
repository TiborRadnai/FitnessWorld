import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Product } from '../models/product';

@Injectable({ providedIn: 'root' })
export class CartService {

  private items: Product[] = [];
  getItems() {
    return this.items;
  }

  private cartCount = new BehaviorSubject<number>(0);
  cartCount$ = this.cartCount.asObservable();

  private cartItems = new BehaviorSubject<Product[]>([]);
  cartItems$ = this.cartItems.asObservable();

  add(product: Product) {
    this.items.push(product);
    this.cartItems.next([...this.items]);
    this.cartCount.next(this.items.length);
  }

  remove(index: number) {
    this.items.splice(index, 1);
    this.cartItems.next([...this.items]);
    this.cartCount.next(this.items.length);
  }

  clear() {
    this.items = [];
    this.cartItems.next([]);
    this.cartCount.next(0);
  }

  getTotal() {
    return this.items.reduce((sum, p) => sum + p.price, 0);
  }
}
