import { fetchBaseQuery, createApi } from '@reduxjs/toolkit/query/react';
import { BASE_URL } from '../constants';

const baseQuery = fetchBaseQuery({ baseUrl: BASE_URL });

const apiSlice = createApi({
  baseQuery,
  tagTypes: ['User', 'Product', 'Order', 'Category'],
  endpoints: () => ({}),
});

export default apiSlice;
