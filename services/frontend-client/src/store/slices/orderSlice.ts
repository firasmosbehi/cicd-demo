import { createSlice } from '@reduxjs/toolkit';

interface OrderState {
  orders: any[];
  loading: boolean;
  error: string | null;
}

const initialState: OrderState = {
  orders: [],
  loading: false,
  error: null,
};

const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const { clearError } = orderSlice.actions;
export default orderSlice.reducer;