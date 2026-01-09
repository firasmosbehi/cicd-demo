import { createSlice } from '@reduxjs/toolkit';

interface AnalyticsState {
  data: any;
  loading: boolean;
  error: string | null;
}

const initialState: AnalyticsState = {
  data: {},
  loading: false,
  error: null,
};

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const { clearError } = analyticsSlice.actions;
export default analyticsSlice.reducer;