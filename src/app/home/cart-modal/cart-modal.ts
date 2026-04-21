import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { FirestoreService } from '../../core/services/firestore.service';
import { CheckoutService } from '../../core/services/checkout.service';
import { doc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase';

@Component({
  selector: 'app-cart-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cart-modal.html',
  styleUrls: ['./cart-modal.css']
})
export class CartModal implements OnInit, OnDestroy {

  show = false;
  cartItems: any[] = [];
  unsubscribe: any;

  private checkout = inject(CheckoutService);

  constructor(
    private auth: AuthService,
    private firestore: FirestoreService
  ) {}

  ngOnInit() {
    this.unsubscribe = this.auth.user$.subscribe(user => {
      if (user) {
        this.firestore.getUserCart(user.uid, (items) => {
          this.cartItems = items;
        });
      }
    });
  }

  ngOnDestroy() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }

  open() {
    this.show = true;
  }

  close() {
    this.show = false;
  }

  removeFromFirestore(productId: string) {
    const user = this.auth.firebaseUser;
    if (!user) return;

    const ref = doc(db, `users/${user.uid}/cart/${productId}`);
    deleteDoc(ref);
  }

  getFirestoreTotal() {
    return this.cartItems
      .reduce((sum, item) => sum + (item.price * item.quantity), 0)
      .toFixed(2);
  }

  startCheckout() {
    const items = this.cartItems.map(item => ({
      name: item.name,
      price: item.price,
      quantity: item.quantity
    }));

    this.checkout.createSession(items)
      .catch(err => {
        console.error('Checkout error:', err);
      });
  }
}
