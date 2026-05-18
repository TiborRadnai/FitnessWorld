import { Component, ViewChild } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { AuthModal } from '../components/auth-modal/auth-modal';
import { CartService } from '../../core/services/cart.service';
import { CartModal } from '../../home/cart-modal/cart-modal';
import { FirestoreService } from '../../core/services/firestore.service';
import { Router, RouterLink, RouterModule } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [NgIf, AuthModal, CartModal, CommonModule, RouterModule],
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
  isDaniel = false;

  @ViewChild(CartModal) cartModal!: CartModal;

  private successHandled = false;

  constructor(
    private auth: AuthService,
    private firestore: FirestoreService,
    private cart: CartService,
    private router: Router          // ✅ Router injektálva
  ) {}

  ngOnInit() {
    this.unsubscribeUser = this.auth.user$.subscribe(async user => {
      this.currentUser = user;
      this.isDaniel = !!user && user.email === 'daniel.ruitz@fitnessworld.com';

      if (!user) {
        this.cartCount = 0;

        if (this.unsubscribeCart) {
          this.unsubscribeCart();   // ✅ Firestore unsubscribe callback
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
    if (this.unsubscribeUser) {
      this.unsubscribeUser.unsubscribe();   // Subscription
    }

    if (this.unsubscribeCart) {
      this.unsubscribeCart();               // Firestore unsubscribe callback
    }
  }

  // 🔥 IDE JÖN AZ ADMIN NAVIGÁCIÓ
  goAdmin() {
    this.router.navigate(['/admin']);
  }

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
    this.scrollTo('services');

    setTimeout(() => {
      const event = new CustomEvent('openServiceModal', { detail: title });
      window.dispatchEvent(event);
    }, 400);

    if (this.isMenuOpen) {
      this.toggleMenu();
    }
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
        items: cartItems
      });

      for (const item of cartItems) {
        await this.firestore.addOrderItem(userId, orderId, item);
        await this.firestore.decreaseStock(item.id, item.quantity);
      }

      await this.firestore.clearUserCart(userId);
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
