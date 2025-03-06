// test.js
import chai from 'chai';
import chaiHttp from 'chai-http';
import request from 'supertest';
import app from './server.js';  // Correct path to your server file
import fs from 'fs'; // Import fs

const { expect } = chai;
chai.use(chaiHttp);

describe('Product API Tests', () => {
    let productId;

    // Before each test, clear the inventory.json file
    beforeEach(async () => {
        // Create a sample inventory.json file.
        const initialInventory = [];

        await new Promise((resolve, reject) => {
            fs.writeFile('./inventory.json', JSON.stringify(initialInventory), (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });

    });



    it('GET /api/products should return an array', async () => {
        const res = await request(app).get('/api/products');
        expect(res.status).to.equal(200);
        expect(res.body).to.be.an('array');
    });

    it('POST /api/products should add a new product', async () => {
        const newProduct = {
            name: "Test Product",
            qty: 5,
            price: 25.99
        };

        const res = await request(app).post('/api/products').send(newProduct);
        expect(res.status).to.equal(201);
        expect(res.body).to.have.property('id');
        expect(res.body.name).to.equal('Test Product');
        productId = res.body.id; // Store the product ID for later tests
    });

    it('PUT /api/products/:id should update a product', async () => {
        // First create a product to update
        const newProduct = {
            name: "Test Product",
            qty: 5,
            price: 25.99
        };
        const createRes = await request(app).post('/api/products').send(newProduct);
        const productId = createRes.body.id;

        const updatedProduct = {
            name: "Updated Product",
            qty: 10,
            price: 39.99
        };

        const res = await request(app).put(`/api/products/${productId}`).send(updatedProduct);
        expect(res.status).to.equal(200);
        expect(res.body.message).to.equal('Updated');

        // Verify the update was successful
        const getRes = await request(app).get('/api/products');
        const updatedItem = getRes.body.find(item => item.id === productId);
        expect(updatedItem.name).to.equal("Updated Product");
        expect(updatedItem.qty).to.equal(10);
        expect(updatedItem.price).to.equal(39.99);
    });

    it('DELETE /api/products/:id should delete a product', async () => {
        const res = await request(app).delete(`/api/products/${productId}`);
        expect(res.status).to.equal(200);
        expect(res.body.message).to.equal('Deleted');

        // Verify the delete was successful
        const getRes = await request(app).get('/api/products');
        const deletedItem = getRes.body.find(item => item.id === productId);
        expect(deletedItem).to.be.undefined;
    });

    after(async () => {
      await new Promise((resolve, reject) => {
          fs.writeFile('./inventory.json', JSON.stringify([]), (err) => {
              if (err) {
                  reject(err);
              } else {
                  resolve();
              }
          });
      });
    });

});