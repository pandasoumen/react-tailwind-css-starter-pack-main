import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

export const getProducts = createAsyncThunk(
  'products/getAll',
  async (_, thunkAPI) => {
    try {
      const response = await axios.get(`${API_URL}/products`);
      return response.data.products;
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

const productSlice = createSlice({
  name: 'products',
  initialState: {
    products: [],
    cart: [],
    isLoading: false,
    isError: false,
    message: '',
  },
  // reducers: {
  //   addToCart: (state, action) => {
  //     const item = state.cart.find(i => i._id === action.payload._id);
  //     if (item) {
  //       item.quantity += 1;
  //     } else {
  //       state.cart.push({ ...action.payload, quantity: 1 });
  //     }
  //   },
  //   removeFromCart: (state, action) => {
  //     state.cart = state.cart.filter(item => item._id !== action.payload);
  //   },

  reducers: {
  addToCart: (state, action) => {
    const existing = state.cart.find((item) => item._id === action.payload._id);
    if (existing) {
      existing.quantity += 1;
    } else {
      state.cart.push({ ...action.payload, quantity: 1 });
    }
  },
  removeFromCart: (state, action) => {
    state.cart = state.cart.filter((item) => item._id !== action.payload);
  },
  clearCart: (state) => {
    state.cart = [];
  }
},
    updateQuantity: (state, action) => {
      const item = state.cart.find(i => i._id === action.payload.id);
      if (item) {
        item.quantity = action.payload.quantity;
      }
    },
    
  //   clearCart: (state) => {
  //     state.cart = [];
  //   },
  // },
  extraReducers: (builder) => {
    builder
      .addCase(getProducts.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.products = action.payload;
      })
      .addCase(getProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { addToCart, removeFromCart, updateQuantity, clearCart } = productSlice.actions;
export default productSlice.reducer;
