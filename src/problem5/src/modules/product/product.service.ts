import { Op } from 'sequelize';
import Product from './product.model';
import { IProduct } from './product.types';
import { AppError } from '../core/middleware/error.middleware';

export class ProductService {
  async create(productData: IProduct): Promise<Product> {
    return await Product.create(productData);
  }

  async findAll(filters: any = {}): Promise<Product[]> {
    const { category, inStock, minPrice, maxPrice } = filters;
    
    const where: any = {};
    
    if (category) {
      where.category = category;
    }
    
    if (inStock !== undefined) {
      where.inStock = inStock === 'true';
    }
    
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price[Op.gte] = Number(minPrice);
      if (maxPrice) where.price[Op.lte] = Number(maxPrice);
    }

    return await Product.findAll({ where });
  }

  async findById(id: number): Promise<Product> {
    const product = await Product.findByPk(id);
    
    if (!product) {
      throw new AppError('Product not found', 404);
    }
    
    return product;
  }

  async update(id: number, updateData: Partial<IProduct>): Promise<Product> {
    const product = await this.findById(id);
    await product.update(updateData);
    return product;
  }

  async delete(id: number): Promise<void> {
    const product = await this.findById(id);
    await product.destroy();
  }
}

export default new ProductService(); 