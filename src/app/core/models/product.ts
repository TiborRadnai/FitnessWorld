export interface Product {
  id: string;          // Firestore doc id
  name: string;
  price: number;
  stock: number;
  imageUrl: string;
  description?: string;
  category?: string;
  active: boolean;
  salePrice?: number;
  saleActive?: boolean;
}


