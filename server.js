// server.js
const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, "inventory.json");

app.use(express.json());
app.use(express.static(__dirname));

// Get Products
app.get("/api/products", (req, res) => {
    fs.readFile(DATA_FILE, "utf8", (err, data) => {
        if (err) return res.status(500).json({ error: "Server error" });
        res.json(JSON.parse(data || "[]"));
    });
});

// Add Product
app.post("/api/products", (req, res) => {
    const { name, qty, price } = req.body;
    if (!name || isNaN(qty) || isNaN(price)) return res.status(400).json({ error: "Invalid input" });

    fs.readFile(DATA_FILE, "utf8", (err, data) => {
        let products = JSON.parse(data || "[]");
        const newProduct = { id: Date.now(), name, qty, price };
        products.push(newProduct);

        fs.writeFile(DATA_FILE, JSON.stringify(products, null, 2), () => res.status(201).json(newProduct));
    });
});

// Update Product
app.put("/api/products/:id", (req, res) => {
    const id = parseInt(req.params.id);
    const { name, qty, price } = req.body;

    fs.readFile(DATA_FILE, "utf8", (err, data) => {
        let products = JSON.parse(data || "[]").map(p => p.id === id ? { id, name, qty, price } : p);
        fs.writeFile(DATA_FILE, JSON.stringify(products, null, 2), () => res.json({ message: "Updated" }));
    });
});

// Delete Product
app.delete("/api/products/:id", (req, res) => {
    const id = parseInt(req.params.id);

    fs.readFile(DATA_FILE, "utf8", (err, data) => {
        let products = JSON.parse(data || "[]").filter(p => p.id !== id);
        fs.writeFile(DATA_FILE, JSON.stringify(products, null, 2), () => res.json({ message: "Deleted" }));
    });
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));