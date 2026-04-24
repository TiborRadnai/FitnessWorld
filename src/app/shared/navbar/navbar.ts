import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIf } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { AuthModal } from '../components/auth-modal/auth-modal';
import { CartService } from '../../core/services/cart.service';
import { CartModal } from '../../home/cart-modal/cart-modal';
import { FirestoreService } from '../../core/services/firestore.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [NgIf, AuthModal, CartModal, CommonModule],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css']
})
export class Navbar {

  isMenuOpen = false;
  isScrolled = false;
  isAuthModalOpen = false;
  currentUser: any = null;
  cartCount = 0;

  unsubscribeUser: any;
  unsubscribeCart: any;

  @ViewChild(CartModal) cartModal!: CartModal;

  private successHandled = false;

  constructor(
    private auth: AuthService,
    private firestore: FirestoreService,
    private cart: CartService,
  ) {}

  scrollTo(sectionId: string) {
    const el = document.getElementById(sectionId);
    if (!el) return;

    el.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });

    if (this.isMenuOpen) {
      this.toggleMenu();
    }
  }

  openServiceModal(title: string) {
    // görgessünk le a Services komponenshez
    this.scrollTo('services');

    // kis késleltetés, hogy a scroll befejeződjön
    setTimeout(() => {
      const event = new CustomEvent('openServiceModal', { detail: title });
      window.dispatchEvent(event);
    }, 400);

    // mobil menü bezárása
    if (this.isMenuOpen) {
      this.toggleMenu();
    }
  }

  ngOnInit() {
    this.unsubscribeUser = this.auth.user$.subscribe(async user => {

      this.currentUser = user;   // <-- EZ HIÁNYZOTT

      if (!user) {
        this.cartCount = 0;

        if (this.unsubscribeCart) {
          this.unsubscribeCart();
          this.unsubscribeCart = null;
        }

        return;
      }

      this.unsubscribeCart = this.firestore.getUserCart(user.uid, (items) => {
        this.cartCount = items.reduce((sum, item) => sum + item.quantity, 0);
      });

      if (!this.successHandled) {
        this.successHandled = true;
        await this.handleStripeSuccess(user.uid);
      }
    });

  }

  ngOnDestroy() {
    if (this.unsubscribeUser) this.unsubscribeUser();
    if (this.unsubscribeCart) this.unsubscribeCart();
  }

  openCart() {
    this.cartModal.open();
  }

  openAuthModal() {
    this.isAuthModalOpen = true;
  }

  closeAuthModal() {
    this.isAuthModalOpen = false;
  }

  logout() {
    this.auth.logout();
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
    document.body.style.overflow = this.isMenuOpen ? 'hidden' : 'auto';
  }

  // 🔥 SUCCESS LOGIKA
  private async handleStripeSuccess(userId: string) {
    const params = new URLSearchParams(window.location.search);

    if (!params.has('success')) return;

    try {

      const cartItems = await this.firestore.getUserCartOnce(userId);

      if (!cartItems.length) {
        this.cleanUrl();
        return;
      }

      const orderId = await this.firestore.createOrder(userId, {
        total: cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0),
        items: cartItems   // <-- EZ KELL
      });

      // 🔥 ORDER ITEMS + STOCK UPDATE
      for (const item of cartItems) {
        await this.firestore.addOrderItem(userId, orderId, item);

        // 🔥 KÉSZLET CSÖKKENTÉSE
        await this.firestore.decreaseStock(item.id, item.quantity);
      }

      // 🔥 KOSÁR TÖRLÉSE
      await this.firestore.clearUserCart(userId);

      // 🔥 TOAST
      this.showSuccessToast();

    } catch (err) {
      console.error('Error handling Stripe success:', err);
    } finally {
      this.cleanUrl();
    }
  }


  private showSuccessToast() {
    const toast = document.createElement('div');

    toast.innerHTML = `
      <div class="fixed top-6 right-6 z-50 
                  bg-green-600 text-white px-6 py-4 rounded-xl shadow-xl
                  flex items-center gap-3
                  animate-[fadeIn_0.3s_ease-out]">

        <span class="text-2xl">✔</span>
        <div class="font-medium text-lg">Payment successful!</div>
      </div>
    `;

    document.body.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('opacity-0', 'transition-opacity', 'duration-500');
    }, 1500);

    setTimeout(() => {
      toast.remove();
    }, 2000);
  }

  private cleanUrl() {
    const url = window.location.origin + window.location.pathname;
    window.history.replaceState({}, '', url);
  }
}
