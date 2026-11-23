import React from 'react';
import { useParams } from 'react-router-dom';
import { Box } from '@mui/material';

import { PageHeader } from '../../components/common/PageHeader';
import { LoadingScreen } from '../../components/common/LoadingScreen';
import { ApiErrorAlert } from '../../components/feedback/ApiErrorAlert';
import { ProductForm } from '../../components/products/ProductForm';
import { useGetProductQuery } from '../../store/api/productsApi';
import { parseApiError } from '../../utils/apiError';
import { ROUTES } from '../../constants/routes';

export const ProductFormPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const isEdit = Boolean(id);

  const { data: product, isLoading, error } = useGetProductQuery(id as string, {
    skip: !isEdit,
  });

  if (isEdit && isLoading) {
    return <LoadingScreen message="Loading product information..." />;
  }

  const parsedError = error ? parseApiError(error) : null;

  return (
    <Box>
      <PageHeader
        title={isEdit ? 'Edit Product' : 'New Product / Service'}
        subtitle={
          isEdit
            ? 'Update pricing, tax rates, and reorder levels.'
            : 'Add a new catalog item, define units, rates, and initial stock.'
        }
        breadcrumbs={[
          { label: 'Products & Inventory', path: ROUTES.products.list },
          {
            label: isEdit ? product?.name ?? 'Edit Product' : 'New Product',
          },
        ]}
      />

      {parsedError && <ApiErrorAlert error={parsedError} />}

      {(!isEdit || product) && <ProductForm initialData={product} />}
    </Box>
  );
};

export default ProductFormPage;
