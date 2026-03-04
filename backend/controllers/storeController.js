const StoreItem = require('../models/StoreItem');

// GET /api/products
exports.listProducts = async (req, res) => {
  try {
    const products = await StoreItem.find().sort({ createdAt: -1 });
    res.json({ success: true, products });
  } catch (err) {
    console.error('listProducts error', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/products/:id
exports.getProduct = async (req, res) => {
  try {
    const product = await StoreItem.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, product });
  } catch (err) {
    console.error('getProduct error', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/products  (admin or doctor)
exports.addProduct = async (req, res) => {
  try {
    // role guard: admin or doctor
    if (!req.user || !['admin', 'doctor'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    const { name, price, description, stock, image, category } = req.body;
    const product = await StoreItem.create({ name, price, description, stock, image, category });
    res.status(201).json({ success: true, product });
  } catch (err) {
    console.error('addProduct error', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/products/:id  (admin or doctor)
exports.updateProduct = async (req, res) => {
  try {
    if (!req.user || !['admin', 'doctor'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    const updates = req.body;
    const product = await StoreItem.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!product) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, product });
  } catch (err) {
    console.error('updateProduct error', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/products/:id  (admin only)
exports.deleteProduct = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin only' });
    }

    const product = await StoreItem.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, message: 'Deleted' });
  } catch (err) {
    console.error('deleteProduct error', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/products/category/:category
exports.getProductsByCategory = async (req, res) => {
  try {
    const products = await StoreItem.find({ category: req.params.category });
    res.json({ success: true, products });
  } catch (err) {
    console.error('getProductsByCategory error', err);
    res.status(500).json({ success: false, message: err.message });
  }
};