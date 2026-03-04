import Product from "../models/Product.js";

const parseTags = (tags) => {
  if (Array.isArray(tags)) {
    return tags.map((tag) => String(tag).trim()).filter(Boolean);
  }
  if (typeof tags === "string") {
    return tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
  }
  return [];
};

const parseImages = (images, image) => {
  if (Array.isArray(images) && images.length > 0) {
    return images.map((img) => String(img).trim()).filter(Boolean);
  }
  if (typeof image === "string" && image.trim()) {
    return [image.trim()];
  }
  return [];
};

const buildProductPayload = (body, forUpdate = false) => {
  const payload = {};

  if (!forUpdate || Object.prototype.hasOwnProperty.call(body, "name")) {
    payload.name = body.name;
  }
  if (!forUpdate || Object.prototype.hasOwnProperty.call(body, "category")) {
    payload.category = body.category;
  }
  if (!forUpdate || Object.prototype.hasOwnProperty.call(body, "description")) {
    payload.description = body.description;
  }
  if (!forUpdate || Object.prototype.hasOwnProperty.call(body, "price")) {
    payload.price = body.price;
  }
  if (!forUpdate || Object.prototype.hasOwnProperty.call(body, "stock")) {
    payload.stock = body.stock;
  }
  if (
    !forUpdate ||
    Object.prototype.hasOwnProperty.call(body, "tags")
  ) {
    payload.tags = parseTags(body.tags);
  }
  if (
    !forUpdate ||
    Object.prototype.hasOwnProperty.call(body, "images") ||
    Object.prototype.hasOwnProperty.call(body, "image")
  ) {
    const images = parseImages(body.images, body.image);
    payload.images = images;
    payload.image = images[0] || "";
  }

  return payload;
};

// Get all products
export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json({ success: true, products });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get product by ID
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    res.json({ success: true, product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Create a product (admin)
export const createProduct = async (req, res) => {
  try {
    const payload = buildProductPayload(req.body);
    const createdProduct = await Product.create(payload);
    res.status(201).json({ success: true, product: createdProduct });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Update product (admin)
export const updateProduct = async (req, res) => {
  try {
    const payload = buildProductPayload(req.body, true);
    const updated = await Product.findByIdAndUpdate(req.params.id, payload, {
      new: true,
      runValidators: true,
    });
    if (!updated) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }
    res.json({ success: true, product: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Delete product (admin)
export const deleteProduct = async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }
    res.json({ success: true, deleted });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
