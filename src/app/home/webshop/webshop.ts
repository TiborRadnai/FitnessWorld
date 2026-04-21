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

  expandedProductId?: string | null;

  toggleDescription(productId: string) {
    this.expandedProductId = this.expandedProductId === productId ? null : productId;
  }

  addToCart(product: Product) {
    // this.cart.add(product);

    const user = this.auth.firebaseUser;
    if (user) {
      this.firestore.addToUserCart(user.uid, product);
    }
  }
}
