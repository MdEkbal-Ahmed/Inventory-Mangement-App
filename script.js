// script.js
const API_URL = "http://localhost:3000/api/products";
let selectedProductId = null;
let sortOrder = {}; // To keep track of sorting order

// Fetch Products and Populate Table
const fetchProducts = async () => {
    try {
        const searchQuery = document.getElementById("search").value.toLowerCase();
        const res = await fetch(API_URL);
        let products = await res.json();

        // Filter by search
        products = products.filter(p => p.name.toLowerCase().includes(searchQuery));

        // Sort products if a column is selected
        const sortedColumn = Object.keys(sortOrder)[0];
        if (sortedColumn) {
            const order = sortOrder[sortedColumn];
            products.sort((a, b) => {
                if (a[sortedColumn] < b[sortedColumn]) return order ? 1 : -1;
                if (a[sortedColumn] > b[sortedColumn]) return order ? -1 : 1;
                return 0;
            });
        }

        document.getElementById("productTable").innerHTML = products
            .map(p => `
                <tr>
                    <td>${p.name}</td>
                    <td>${p.qty}</td>
                    <td>$${p.price.toFixed(2)}</td>
                    <td>
                        <button class="btn btn-warning btn-sm me-2" onclick="editProduct(${p.id}, '${p.name}', ${p.qty}, ${p.price})">Edit</button>
                        <button class="btn btn-danger btn-sm" onclick="deleteProduct(${p.id})">Delete</button>
                    </td>
                </tr>
            `).join('');

        updateTotalValue(products);
    } catch (error) {
        console.error("Error fetching products:", error);
    }
};

// Sort Table
const sortTable = (column) => {
    sortOrder = { [column]: !sortOrder[column] };
    fetchProducts();
};

// Update Total Value
const updateTotalValue = (products) => {
    const total = products.reduce((sum, p) => sum + (p.qty * p.price), 0);
    document.getElementById("totalValue").innerText = `${total.toFixed(2)}`;
};

// Event Listeners for Sorting
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("nameHeader").addEventListener("click", () => sortTable("name"));
    document.getElementById("qtyHeader").addEventListener("click", () => sortTable("qty"));
    document.getElementById("priceHeader").addEventListener("click", () => sortTable("price"));
    fetchProducts();
});

// Add Product
const addProduct = async () => {
    const name = document.getElementById("name").value.trim();
    const qty = parseInt(document.getElementById("qty").value);
    const price = parseFloat(document.getElementById("price").value);

    if (!name || isNaN(qty) || isNaN(price) || qty < 0 || price < 0) {
        alert("Invalid product details!");
        return;
    }

    try {
        await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, qty, price })
        });
        clearFields();
        fetchProducts();
    } catch (error) {
        console.error("Error adding product:", error);
    }
};

// Edit Product
const editProduct = (id, name, qty, price) => {
    document.getElementById("name").value = name;
    document.getElementById("qty").value = qty;
    document.getElementById("price").value = price;
    selectedProductId = id;
    document.getElementById("updateBtn").disabled = false;
};

// Update Product
const updateProduct = async () => {
    if (!selectedProductId) return;

    const name = document.getElementById("name").value.trim();
    const qty = parseInt(document.getElementById("qty").value);
    const price = parseFloat(document.getElementById("price").value);

    if (!name || isNaN(qty) || isNaN(price) || qty < 0 || price < 0) {
        alert("Invalid product details!");
        return;
    }

    try {
        await fetch(`${API_URL}/${selectedProductId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, qty, price })
        });
        selectedProductId = null;
        clearFields();
        document.getElementById("updateBtn").disabled = true;
        fetchProducts();
    } catch (error) {
        console.error("Error updating product:", error);
    }
};

// Delete Product
const deleteProduct = async (id) => {
    try {
        await fetch(`${API_URL}/${id}`, { method: "DELETE" });
        fetchProducts();
    } catch (error) {
        console.error("Error deleting product:", error);
    }
};

// Clear Input Fields
const clearFields = () => {
    document.getElementById("name").value = "";
    document.getElementById("qty").value = "";
    document.getElementById("price").value = "";
};

document.addEventListener("DOMContentLoaded", fetchProducts);


const exportToCSV = async () => {
    try {
        const res = await fetch(API_URL);
        const products = await res.json();

        if (products.length === 0) {
            alert("No data available to export!");
            return;
        }

        const rows = [["Name", "Quantity", "Price"]]; // CSV Header

        // Convert Products Data to CSV Rows
        products.forEach(product => {
            rows.push([product.name, product.qty, product.price]);
        });

        // Convert to CSV Format
        let csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n");

        // Create Download Link
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "products.csv");
        document.body.appendChild(link);

        // Trigger Download
        link.click();
        document.body.removeChild(link);
    } catch (error) {
        console.error("Error exporting to CSV:", error);
    }
};

