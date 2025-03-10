import request from 'supertest';
import app from '../../app';
import sequelize from '../core/config/db.config';
import User from '../user/user.model';

// Test data
const sampleProduct = {
  name: 'Test Product',
  description: 'This is a test product for unit testing',
  price: 99.99,
  category: 'test',
  inStock: true,
};

const adminUser = {
  name: 'Admin User',
  email: 'admin@example.com',
  password: 'Test@1234',
  passwordConfirm: 'Test@1234',
  role: 'admin',
};

const regularUser = {
  name: 'Regular User',
  email: 'user@example.com',
  password: 'Test@1234',
  passwordConfirm: 'Test@1234',
  role: 'user',
};

// Authentication tokens
let adminToken: string;
let userToken: string;
let adminApiKey: string;

describe('Product API', () => {
  // Setup before tests
  beforeAll(async () => {
    // Sync database
    await sequelize.sync({ force: true });

    // Create admin user
    await request(app).post('/api/users/register').send(adminUser);

    // Create regular user
    await request(app).post('/api/users/register').send(regularUser);

    // Login admin user to get token
    const adminLoginRes = await request(app).post('/api/users/login').send({
      email: adminUser.email,
      password: adminUser.password,
    });
    adminToken = adminLoginRes.body.token;
    // Login regular user to get token
    const userLoginRes = await request(app).post('/api/users/login').send({
      email: regularUser.email,
      password: regularUser.password,
    });
    userToken = userLoginRes.body.token;

    // Generate API key for admin
    const apiKeyRes = await request(app)
      .post('/api/users/api-key')
      .set('Authorization', `Bearer ${adminToken}`);
    adminApiKey = apiKeyRes.body.apiKey;
  });

  afterAll(async () => {
    await sequelize.close();
  });

  // Test: Create a product with admin JWT
  it('should create a new product with admin JWT auth', async () => {
    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(sampleProduct);

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('status', 'success');
    expect(res.body.data).toHaveProperty('id');
    expect(res.body.data.name).toEqual(sampleProduct.name);
  });

  // Test: Create a product with API key
  it('should create a new product with API key auth', async () => {
    const res = await request(app)
      .post('/api/products')
      .set('X-API-Key', adminApiKey)
      .send({
        ...sampleProduct,
        name: 'API Key Product',
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('status', 'success');
    expect(res.body.data).toHaveProperty('id');
    expect(res.body.data.name).toEqual('API Key Product');
  });

  // Test: Regular user cannot create a product
  it('should forbid creating a product for regular users', async () => {
    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${userToken}`)
      .send(sampleProduct);

    expect(res.statusCode).toEqual(403);
    expect(res.body).toHaveProperty('status', 'fail');
  });

  // Test: Get all products
  it('should get all products (authenticated)', async () => {
    const res = await request(app).get('/api/products').set('Authorization', `Bearer ${userToken}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('status', 'success');
    expect(res.body).toHaveProperty('results');
    expect(Array.isArray(res.body.data)).toBeTruthy();
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  // Test: Get product by ID
  it('should get a product by ID', async () => {
    // First create a product
    const createRes = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        ...sampleProduct,
        name: 'Get By ID Product',
      });

    const productId = createRes.body.data.id;

    // Now get the product
    const getRes = await request(app)
      .get(`/api/products/${productId}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(getRes.statusCode).toEqual(200);
    expect(getRes.body).toHaveProperty('status', 'success');
    expect(getRes.body.data).toHaveProperty('id', productId);
    expect(getRes.body.data.name).toEqual('Get By ID Product');
  });

  // Test: Update a product with admin
  it('should update a product with admin JWT auth', async () => {
    // First create a product
    const createRes = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        ...sampleProduct,
        name: 'Update Product',
      });

    const productId = createRes.body.data.id;

    // Now update the product
    const updateRes = await request(app)
      .put(`/api/products/${productId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Updated Product Name',
        price: 88.88,
      });

    expect(updateRes.statusCode).toEqual(200);
    expect(updateRes.body).toHaveProperty('status', 'success');
    expect(updateRes.body.data).toHaveProperty('id', productId);
    expect(updateRes.body.data.name).toEqual('Updated Product Name');
    expect(updateRes.body.data.price).toEqual(88.88);
  });

  // Test: Regular user cannot update a product
  it('should forbid updating a product for regular users', async () => {
    // First create a product
    const createRes = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        ...sampleProduct,
        name: 'Forbidden Update Product',
      });

    const productId = createRes.body.data.id;

    // Now try to update the product with regular user
    const updateRes = await request(app)
      .put(`/api/products/${productId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        name: 'User Updated Product',
      });

    expect(updateRes.statusCode).toEqual(403);
    expect(updateRes.body).toHaveProperty('status', 'fail');
  });

  // Test: Delete a product with admin
  it('should delete a product with admin JWT auth', async () => {
    // First create a product
    const createRes = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        ...sampleProduct,
        name: 'Delete Product',
      });

    const productId = createRes.body.data.id;

    // Now delete the product
    const deleteRes = await request(app)
      .delete(`/api/products/${productId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(deleteRes.statusCode).toEqual(204);

    // Verify product is deleted
    const getRes = await request(app)
      .get(`/api/products/${productId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(getRes.statusCode).toEqual(404);
  });

  // Test: Regular user cannot delete a product
  it('should forbid deleting a product for regular users', async () => {
    // First create a product
    const createRes = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        ...sampleProduct,
        name: 'Forbidden Delete Product',
      });

    const productId = createRes.body.data.id;

    // Now try to delete the product with regular user
    const deleteRes = await request(app)
      .delete(`/api/products/${productId}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(deleteRes.statusCode).toEqual(403);
    expect(deleteRes.body).toHaveProperty('status', 'fail');

    // Verify product still exists
    const getRes = await request(app)
      .get(`/api/products/${productId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(getRes.statusCode).toEqual(200);
  });
});
