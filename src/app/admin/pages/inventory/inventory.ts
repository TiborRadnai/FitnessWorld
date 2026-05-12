import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FirestoreService } from '../../../core/services/firestore.service';
import { Product } from '../../../core/models/product';

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './inventory.html',
  styleUrl: './inventory.css'
})
export class Inventory implements OnInit {

  products = signal<Product[]>([]);
  showProductModal = signal(false);
  editingProduct = signal<Product | null>(null);
  form = signal<Partial<Product>>({
    name: '',
    description: '',
    price: 0,
    stock: 0,
    imageUrl: '',
    active: true,
    saleActive: false,
    category: 'equipment'
  });
  showImagePicker = signal(false);
  images = signal<{ name: string, url: string }[]>([]);

  constructor(private firestore: FirestoreService) {}

  async ngOnInit() {
    await this.loadProducts();
  }

  async loadProducts() {
    const data = await this.firestore.getProducts();

    const baseUrl =
      'https://firebasestorage.googleapis.com/v0/b/fitnessworld-56f74.firebasestorage.app/o/products%2F';

    const fixed = data.map(p => ({
      ...p,
      imageUrl: p.imageUrl.startsWith('http')
        ? p.imageUrl
        : `${baseUrl}${encodeURIComponent(p.imageUrl)}?alt=media`
    }));

    this.products.set(fixed);
  }

  openAddProduct() {
    this.editingProduct.set(null);
    this.form.set({
      name: '',
      description: '',
      price: 0,
      stock: 0,
      imageUrl: '',
      active: true,
      saleActive: false,
      category: 'equipment'
    });
    this.showProductModal.set(true);
  }

  openEditProduct(product: Product) {
    this.editingProduct.set(product);
    this.form.set({ ...product });
    this.showProductModal.set(true);
  }

  async saveProduct() {
    const product = this.form();

    if (!product.name || !product.imageUrl) return;

    if (this.editingProduct()) {
      await this.firestore.updateProduct(this.editingProduct()!.id, product);
    } else {
      await this.firestore.addProduct(product as Product);
    }

    this.showProductModal.set(false);
    await this.loadProducts();
  }

  async deleteProduct(id: string) {
    await this.firestore.deleteProduct(id);
    await this.loadProducts();
  }

  async openImagePicker() {
  this.images.set(await this.firestore.listImages());
  this.showImagePicker.set(true);
}

  async uploadNewImage(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    await this.firestore.uploadImage(file);

    // újra listázás
    this.images.set(await this.firestore.listImages());
  }

  selectImage(name: string) {
    this.form().imageUrl = name;
    this.showImagePicker.set(false);
  }

  getImagePreviewUrl(fileName: string | undefined) {
    if (!fileName) return '';

    if (fileName.startsWith('http')) return fileName;

    return `https://firebasestorage.googleapis.com/v0/b/fitnessworld-56f74.firebasestorage.app/o/products%2F${encodeURIComponent(fileName)}?alt=media`;
  }
}
