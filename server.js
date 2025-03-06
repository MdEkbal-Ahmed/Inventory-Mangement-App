// server.js
import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, "inventory.json");

app.use(express.json());
app.use(express.static(__dirname));

// Helper function to read data from the file
const readData = () => {
  return new Promise((resolve, reject) => {
    fs.readFile(DATA_FILE, "utf8", (err, data) => {
      if (err) {
        reject(err);
      } else {
        try {
          resolve(JSON.parse(data || "[]"));
        } catch (parseError) {
          reject(parseError); // Handle JSON parsing errors
        }
      }
    });
  });
};

// Helper function to write data to the file
const writeData = (data) => {
  return new Promise((resolve, reject) => {
    fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};


// Get Products
app.get("/api/products", async (req, res) => {
    try {
        const products = await readData();
        res.json(products);
    } catch (error) {
        console.error("Error reading data:", error);
        res.status(500).json({ error: "Server error: Could not read data." });
    }
});

// Add Product
app.post("/api/products", async (req, res) => {
  const { name, qty, price } = req.body;
  if (!name || isNaN(qty) || isNaN(price)) {
    return res.status(400).json({ error: "Invalid input" });
  }

  try {
    const products = await readData();
    const newProduct = { id: Date.now(), name, qty, price };
    products.push(newProduct);
    await writeData(products);
    res.status(201).json(newProduct);
  } catch (error) {
    console.error("Error adding product:", error);
    res.status(500).json({ error: "Server error: Could not add product." });
  }
});

// Update Product
app.put("/api/products/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const { name, qty, price } = req.body;
  if (!name || isNaN(qty) || isNaN(price)) {
    return res.status(400).json({ error: "Invalid input" });
  }


  try {
    const products = await readData();
    const updatedProducts = products.map((p) =>
      p.id === id ? { id, name, qty, price } : p
    );
    await writeData(updatedProducts);
    res.json({ message: "Updated" });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ error: "Server error: Could not update product." });
  }
});

// Delete Product
app.delete("/api/products/:id", async (req, res) => {
  const id = parseInt(req.params.id);

  try {
    const products = await readData();
    const filteredProducts = products.filter((p) => p.id !== id);
    await writeData(filteredProducts);
    res.json({ message: "Deleted" });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ error: "Server error: Could not delete product." });
  }
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

export default app;