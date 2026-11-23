import { baseApi } from './baseApi';
import { API_TAGS } from '../../constants/tags';
import { buildQueryParams } from '../../utils/query';
import type { Paginated } from '../../types/api/common';
import type {
  StockMovement,
  StockMovementDto,
  StockMovementListParams,
} from '../../types/api/product';

function normalizeStockMovement(dto: StockMovementDto): StockMovement {
  return {
    ...dto,
    invoice: dto.invoice ?? undefined,
  };
}

export const stockApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getStockMovements: builder.query<
      Paginated<StockMovement>,
      StockMovementListParams | void
    >({
      query: (params) => ({
        url: '/stock-movements/',
        params: buildQueryParams(params ?? {}),
      }),
      transformResponse: (
        res: Paginated<StockMovementDto>
      ): Paginated<StockMovement> => ({
        ...res,
        results: res.results.map(normalizeStockMovement),
      }),
      providesTags: [API_TAGS.STOCK_MOVEMENT],
    }),
  }),
});

export const { useGetStockMovementsQuery } = stockApi;
