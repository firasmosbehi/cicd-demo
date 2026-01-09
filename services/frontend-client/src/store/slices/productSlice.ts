import { createSlice } from '@reduxjs/toolkit';

interface ProductState {
  products: any[];
  loading: boolean;
  error: string | null;
}

const initialState: ProductState = {
  products: [],
  loading: false,
  error: null,
};

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const { clearError } = productSlice.actions;
export default productSlice.reducer;