import { baseApi } from './baseApi';
import { API_TAGS } from '../../constants/tags';
import { buildQueryParams } from '../../utils/query';
import type { Paginated } from '../../types/api/common';
import type {
  Product,
  ProductDto,
  Unit,
  CreateProductRequest,
  UpdateProductRequest,
  ProductListParams,
  StockInRequest,
  AdjustStockRequest,
} from '../../types/api/product';

function normalizeProduct(dto: ProductDto): Product {
  return {
    ...dto,
    description: dto.description ?? undefined,
    reorder_level: dto.reorder_level ?? undefined,
    current_stock: dto.current_stock ?? undefined,
  };
}

export const productsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getUnits: builder.query<Paginated<Unit>, void>({
      query: () => '/units/',
      providesTags: [API_TAGS.UNIT],
    }),
    getProducts: builder.query<Paginated<Product>, ProductListParams | void>({
      query: (params) => ({
        url: '/products/',
        params: buildQueryParams(params ?? {}),
      }),
      transformResponse: (res: Paginated<ProductDto>): Paginated<Product> => ({
        ...res,
        results: res.results.map(normalizeProduct),
      }),
      providesTags: [API_TAGS.PRODUCT],
    }),
    getProduct: builder.query<Product, number | string>({
      query: (id) => `/products/${id}/`,
      transformResponse: normalizeProduct,
      providesTags: (_res, _err, id) => [{ type: API_TAGS.PRODUCT, id }],
    }),
    createProduct: builder.mutation<Product, CreateProductRequest>({
      query: (body) => ({
        url: '/products/',
        method: 'POST',
        body,
      }),
      transformResponse: normalizeProduct,
      invalidatesTags: [
        API_TAGS.PRODUCT,
        API_TAGS.STOCK_MOVEMENT,
        API_TAGS.DASHBOARD,
      ],
    }),
    updateProduct: builder.mutation<Product, UpdateProductRequest>({
      query: ({ id, ...body }) => ({
        url: `/products/${id}/`,
        method: 'PATCH',
        body,
      }),
      transformResponse: normalizeProduct,
      invalidatesTags: (_res, _err, { id }) => [
        API_TAGS.PRODUCT,
        { type: API_TAGS.PRODUCT, id },
      ],
    }),
    stockIn: builder.mutation<Product, StockInRequest>({
      query: ({ id, ...body }) => ({
        url: `/products/${id}/stock-in/`,
        method: 'POST',
        body,
      }),
      transformResponse: normalizeProduct,
      invalidatesTags: (_res, _err, { id }) => [
        API_TAGS.PRODUCT,
        { type: API_TAGS.PRODUCT, id },
        API_TAGS.STOCK_MOVEMENT,
        API_TAGS.DASHBOARD,
      ],
    }),
    adjustStock: builder.mutation<Product, AdjustStockRequest>({
      query: ({ id, ...body }) => ({
        url: `/products/${id}/adjust/`,
        method: 'POST',
        body,
      }),
      transformResponse: normalizeProduct,
      invalidatesTags: (_res, _err, { id }) => [
        API_TAGS.PRODUCT,
        { type: API_TAGS.PRODUCT, id },
        API_TAGS.STOCK_MOVEMENT,
        API_TAGS.DASHBOARD,
      ],
    }),
  }),
});

export const {
  useGetUnitsQuery,
  useGetProductsQuery,
  useGetProductQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useStockInMutation,
  useAdjustStockMutation,
} = productsApi;
