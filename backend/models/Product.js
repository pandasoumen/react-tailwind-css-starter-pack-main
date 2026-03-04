import mongoose from "mongoose";

const makeCategoryPrefix = (category) => {
  const words = String(category || "")
    .replace(/[^a-zA-Z0-9 ]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  let rawPrefix = "PRO";
  if (words.length >= 2) {
    rawPrefix = `${words[0].slice(0, 2)}${words[1].slice(0, 2)}`;
  } else if (words.length === 1) {
    rawPrefix = words[0].slice(0, 3);
  }

  const clean = rawPrefix.replace(/[^a-zA-Z0-9]/g, "") || "PRO";
  return clean.charAt(0).toUpperCase() + clean.slice(1).toLowerCase();
};

const buildProductId = (category) => {
  const prefix = makeCategoryPrefix(category);
  const randomSix = Math.floor(100000 + Math.random() * 900000);
  return `${prefix}${randomSix}`;
};

const productSchema = new mongoose.Schema(
  {
    productId: {
      type: String,
      unique: true,
      index: true,
      sparse: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    stock: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    image: {
      type: String,
      default: "",
      trim: true,
    },
    images: {
      type: [String],
      default: [],
    },
    tags: {
      type: [String],
      default: [],
      index: true,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
    },
    reviews: {
      type: Number,
      default: 0,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    isHidden: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  { timestamps: true }
);

productSchema.pre("validate", async function autoGenerateProductId(next) {
  if (!this.isNew || this.productId) {
    next();
    return;
  }

  const ProductModel = this.constructor;
  let candidate = "";
  let exists = true;
  let attempts = 0;

  while (exists && attempts < 10) {
    candidate = buildProductId(this.category);
    exists = Boolean(await ProductModel.exists({ productId: candidate }));
    attempts += 1;
  }

  if (exists) {
    next(new Error("Could not generate a unique productId."));
    return;
  }

  this.productId = candidate;
  next();
});

const Product = mongoose.model("Product", productSchema);

export default Product;
