export interface IProduct {
  id?: number;
  name: string;
  description: string;
  price: number;
  category: string;
  inStock: boolean;
  createdAt?: Date;
  updatedAt?: Date;
} 