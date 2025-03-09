import request from 'supertest';
import app from '../../app';
import sequelize from '../core/config/db.config';

// Mock data
const sampleProduct = {
  name: 'Test Product',
  description: 'A product created for testing',
  price: 99.99,
  category: 'test',
  inStock: true,
};

let productId: number;

// Connect to test database before all tests
beforeAll(async () => {
  // You'd typically use a test database here
  await sequelize.sync({ force: true }); // Recreate tables
});

// Clean up after all tests
afterAll(async () => {
  await sequelize.close();
});

describe('Product API', () => {
  // Test product creation
  it('should create a new product', async () => {
    const res = await request(app).post('/api/products').send(sampleProduct);

    expect(res.statusCode).toEqual(201);
    expect(res.body.status).toEqual('success');
    expect(res.body.data).toHaveProperty('id');
    expect(res.body.data.name).toEqual(sampleProduct.name);

    productId = res.body.data.id; // Store for later tests
  });

  // Test getting all products
  it('should fetch all products', async () => {
    const res = await request(app).get('/api/products');

    expect(res.statusCode).toEqual(200);
    expect(res.body.status).toEqual('success');
    expect(Array.isArray(res.body.data)).toBeTruthy();
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  // Test getting a single product
  it('should fetch a single product by id', async () => {
    const res = await request(app).get(`/api/products/${productId}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.status).toEqual('success');
    expect(res.body.data.id).toEqual(productId);
  });

  // Test updating a product
  it('should update a product', async () => {
    const updateData = {
      name: 'Updated Test Product',
      price: 129.99,
    };

    const res = await request(app).put(`/api/products/${productId}`).send(updateData);

    expect(res.statusCode).toEqual(200);
    expect(res.body.status).toEqual('success');
    expect(res.body.data.name).toEqual(updateData.name);
    expect(parseFloat(res.body.data.price)).toEqual(updateData.price);
  });

  // Test validation errors
  it('should return validation error for invalid input', async () => {
    const res = await request(app).post('/api/products').send({ name: 'A' }); // Missing required fields

    expect(res.statusCode).toEqual(400);
    expect(res.body.status).toEqual('fail');
  });

  // Test deleting a product
  it('should delete a product', async () => {
    const res = await request(app).delete(`/api/products/${productId}`);

    expect(res.statusCode).toEqual(204);

    // Verify product is deleted
    const checkRes = await request(app).get(`/api/products/${productId}`);
    expect(checkRes.statusCode).toEqual(404);
  });
});
