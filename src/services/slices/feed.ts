import { getFeedsApi } from '@api';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import type { TFeedState } from '@utils-types';

const initialState: TFeedState = {
  orders: [],
  total: 0,
  totalToday: 0,
  isLoading: false,
  error: null,
};

export const fetchFeeds = createAsyncThunk('feed/fetchFeeds', () => getFeedsApi());

export const feedSlice = createSlice({
  name: 'feed',
  initialState,
  reducers: {},
  selectors: {
    selectFeed: (state) => state,
    selectFeedOrders: (state) => state.orders,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFeeds.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchFeeds.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orders = action.payload.orders;
        state.total = action.payload.total;
        state.totalToday = action.payload.totalToday;
      })
      .addCase(fetchFeeds.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error;
      });
  },
});

export const { selectFeed, selectFeedOrders } = feedSlice.selectors;
