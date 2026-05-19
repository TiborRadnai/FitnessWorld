import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FirestoreService } from '../../core/services/firestore.service';
import { Product } from '../../core/models/product';
import { CartService } from '../../core/services/cart.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-webshop',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './webshop.html',
  styleUrls: ['./webshop.css']
})

export class Webshop implements OnInit {

  products: Product[] = [];

  constructor(
    private firestore: FirestoreService, 
    private cart: CartService,
    private auth: AuthService) {}

  async ngOnInit() {
    this.products = await this.firestore.getProducts();
  }

  getImageUrl(fileName: string) {
    return `https://firebasestorage.googleapis.com/v0/b/fitnessworld-56f74.firebasestorage.app/o/products%2F${fileName}?alt=media`;
  }

  expandedProductId: string | null = null;

  toggleDescription(id: string) {
    // Mobilon toggle
    if (window.innerWidth < 768) {
      this.expandedProductId = this.expandedProductId === id ? null : id;
    }
  }

  onMouseEnter(id: string) {
    // Desktop hover
    if (window.innerWidth >= 768) {
      this.expandedProductId = id;
    }
  }

  onMouseLeave() {
    if (window.innerWidth >= 768) {
      this.expandedProductId = null;
    }
  }

  async addToCart(product: Product) {
    const user = this.auth.firebaseUser;

    if (!user) {
      this.showLocalToast(product.id, "Please log in first", "red");
      return;
    }

    // 🔥 KÉSZLETELLENŐRZÉS
    const fresh = await this.firestore.getProduct(product.id);

    if (!fresh || fresh.stock < 1) {
      this.showLocalToast(product.id, `"${product.name}" is out of stock`, "red");
      return;
    }

    // 🔥 KOSÁRBA TÉTEL
    await this.firestore.addToUserCart(user.uid, product);

    // 🔥 SIKERES VISSZAJELZÉS
    this.showLocalToast(product.id, `"${product.name}" added!`, "green");
  }

  private showLocalToast(productId: string, message: string, color: "red" | "green") {
    const card = document.querySelector(`[data-product="${productId}"]`);
    if (!card) return;

    const toast = document.createElement('div');

    toast.innerHTML = `
      <div class="absolute top-2 right-2 z-50
                  ${color === "red" ? "bg-red-600" : "bg-green-600"}
                  text-white px-3 py-2 rounded-lg shadow-lg text-sm
                  animate-[fadeIn_0.2s_ease-out]">
        ${message}
      </div>
    `;

    toast.classList.add("local-toast");
    card.appendChild(toast);

    setTimeout(() => toast.classList.add("opacity-0"), 1500);
    setTimeout(() => toast.remove(), 2000);
  }

}
