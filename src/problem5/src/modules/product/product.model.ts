import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../../modules/core/config/db.config';
import { IProduct } from './product.types';

// Interface for Product creation attributes
interface ProductCreationAttributes extends Optional<IProduct, 'id'> {}

// Product model class
class Product extends Model<IProduct, ProductCreationAttributes> implements IProduct {
  public id!: number;
  public name!: string;
  public description!: string;
  public price!: number;
  public category!: string;
  public inStock!: boolean;
  
  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Product.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    inStock: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    sequelize,
    tableName: 'products',
    timestamps: true,
  }
);

export default Product; 