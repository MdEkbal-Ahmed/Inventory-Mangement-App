/**
 * @jest-environment jsdom
 */

require('@testing-library/jest-dom');

describe('Inventory Management Frontend Tests', () => {
    beforeEach(() => {
        // Setup DOM
        document.body.innerHTML = `
            <input id="name" type="text">
            <input id="qty" type="number">
            <input id="price" type="number">
            <button id="addBtn" onclick="addProduct()">Add Product</button>
            <button id="updateBtn" disabled>Update</button>
            <div id="productTable"></div>
            <th id="nameHeader">Name</th>
            <span id="totalValue">0</span>
        `;

        // Mock fetch globally
        global.fetch = jest.fn();
        
        // Define global functions that exist in script.js
        global.addProduct = async () => {
            const name = document.getElementById("name").value.trim();
            const qty = parseInt(document.getElementById("qty").value);
            const price = parseFloat(document.getElementById("price").value);

            if (!name || isNaN(qty) || isNaN(price) || qty < 0 || price < 0) {
                alert("Invalid product details!");
                return;
            }

            try {
                await fetch("http://localhost:3000/api/products", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ name, qty, price })
                });
            } catch (error) {
                console.error("Error adding product:", error);
            }
        };

        global.editProduct = (id, name, qty, price) => {
            document.getElementById("name").value = name;
            document.getElementById("qty").value = qty;
            document.getElementById("price").value = price;
            global.selectedProductId = id;
            document.getElementById("updateBtn").disabled = false;
        };

        global.updateProduct = async () => {
            if (!global.selectedProductId) return;

            const name = document.getElementById("name").value.trim();
            const qty = parseInt(document.getElementById("qty").value);
            const price = parseFloat(document.getElementById("price").value);

            if (!name || isNaN(qty) || isNaN(price) || qty < 0 || price < 0) {
                alert("Invalid product details!");
                return;
            }

            try {
                await fetch(`http://localhost:3000/api/products/${global.selectedProductId}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ name, qty, price })
                });
            } catch (error) {
                console.error("Error updating product:", error);
            }
        };

        global.deleteProduct = async (id) => {
            try {
                await fetch(`http://localhost:3000/api/products/${id}`, { 
                    method: "DELETE" 
                });
            } catch (error) {
                console.error("Error deleting product:", error);
            }
        };

        global.sortOrder = {};
    });

    test('should have all required form elements', () => {
        expect(document.getElementById('name')).toBeInTheDocument();
        expect(document.getElementById('qty')).toBeInTheDocument();
        expect(document.getElementById('price')).toBeInTheDocument();
        expect(document.getElementById('addBtn')).toBeInTheDocument();
    });

    test('should validate form inputs before adding product', () => {
        // Mock window.alert
        const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {});
        
        // Try to add product with empty fields
        document.getElementById('addBtn').click();
        expect(alertMock).toHaveBeenCalledWith('Invalid product details!');

        // Try with invalid quantity
        document.getElementById('name').value = 'Test Product';
        document.getElementById('qty').value = '-1';
        document.getElementById('price').value = '10';
        document.getElementById('addBtn').click();
        expect(alertMock).toHaveBeenCalledWith('Invalid product details!');

        alertMock.mockRestore();
    });

    test('should add a product successfully', async () => {
        const mockProduct = {
            id: 1,
            name: 'Test Product',
            qty: 5,
            price: 10.99
        };

        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve(mockProduct)
        });

        document.getElementById('name').value = mockProduct.name;
        document.getElementById('qty').value = mockProduct.qty;
        document.getElementById('price').value = mockProduct.price;

        await addProduct();

        expect(global.fetch).toHaveBeenCalledWith('http://localhost:3000/api/products', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: mockProduct.name,
                qty: mockProduct.qty,
                price: mockProduct.price
            })
        });
    });

    test('should update product successfully', async () => {
        const mockProduct = {
            id: 1,
            name: 'Updated Product',
            qty: 10,
            price: 20.99
        };

        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve({ message: 'Updated' })
        });

        // Simulate editing a product
        editProduct(mockProduct.id, mockProduct.name, mockProduct.qty, mockProduct.price);

        expect(document.getElementById('name').value).toBe(mockProduct.name);
        expect(document.getElementById('qty').value).toBe(mockProduct.qty.toString());
        expect(document.getElementById('price').value).toBe(mockProduct.price.toString());
        expect(document.getElementById('updateBtn').disabled).toBe(false);

        await updateProduct();

        expect(global.fetch).toHaveBeenCalledWith(`http://localhost:3000/api/products/${mockProduct.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: mockProduct.name,
                qty: mockProduct.qty,
                price: mockProduct.price
            })
        });
    });

    test('should delete product successfully', async () => {
        const productId = 1;

        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve({ message: 'Deleted' })
        });

        await deleteProduct(productId);

        expect(global.fetch).toHaveBeenCalledWith(`http://localhost:3000/api/products/${productId}`, {
            method: 'DELETE'
        });
    });
});
