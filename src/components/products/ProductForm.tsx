import React, { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Box, Button, CircularProgress, Grid, Alert, Typography } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import { useNavigate } from 'react-router-dom';

import {
  createProductSchema,
  updateProductSchema,
  type CreateProductFormValues,
  type UpdateProductFormValues,
} from '../../schemas/product';
import { FormTextField } from '../form/FormTextField';
import { FormSelect } from '../form/FormSelect';
import { FormMoneyField } from '../form/FormMoneyField';
import { FormQuantityField } from '../form/FormQuantityField';
import { FormSwitch } from '../form/FormSwitch';
import { SectionCard } from '../common/SectionCard';

import {
  useCreateProductMutation,
  useUpdateProductMutation,
  useGetUnitsQuery,
} from '../../store/api/productsApi';
import { useNotify } from '../../hooks/useNotify';
import { useApiFormErrors } from '../../hooks/useApiFormErrors';
import { ITEM_TYPE, ITEM_TYPE_LABEL, type ItemType } from '../../constants/enums';
import { ROUTES } from '../../constants/routes';
import { MESSAGES } from '../../constants/messages';
import type { Product } from '../../types/api/product';

export interface ProductFormProps {
  initialData?: Product;
}

const itemTypeOptions = [
  { value: ITEM_TYPE.GOODS, label: ITEM_TYPE_LABEL[ITEM_TYPE.GOODS] },
  { value: ITEM_TYPE.GOODS_HARDWARE, label: ITEM_TYPE_LABEL[ITEM_TYPE.GOODS_HARDWARE] },
  { value: ITEM_TYPE.SERVICE, label: ITEM_TYPE_LABEL[ITEM_TYPE.SERVICE] },
];

export const ProductForm: React.FC<ProductFormProps> = ({ initialData }) => {
  const navigate = useNavigate();
  const { notifySuccess } = useNotify();
  const isEdit = Boolean(initialData);

  const { data: unitsData } = useGetUnitsQuery();
  const [createProduct, { isLoading: isCreating }] = useCreateProductMutation();
  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();

  const [submitError, setSubmitError] = useState<string | null>(null);

  const unitOptions = (unitsData?.results ?? []).map((u) => ({
    value: u.id,
    label: u.name,
  }));

  const methods = useForm<CreateProductFormValues | UpdateProductFormValues>({
    resolver: zodResolver(isEdit ? updateProductSchema : createProductSchema),
    defaultValues: {
      name: initialData?.name ?? '',
      code: initialData?.code ?? '',
      description: initialData?.description ?? '',
      item_type: (initialData?.item_type ?? ITEM_TYPE.GOODS) as ItemType,
      unit: initialData?.unit ?? (unitOptions[0]?.value as number) ?? 1,
      selling_price: initialData?.selling_price ?? '',
      hsn_sac: initialData?.hsn_sac ?? '',
      gst_rate: initialData?.gst_rate ?? '18.00',
      reorder_level: initialData?.reorder_level ?? '',
      opening_stock: '',
      is_active: initialData?.is_active ?? true,
    },
  });

  const { handleApiFormErrors } = useApiFormErrors(methods.setError);
  const selectedItemType = methods.watch('item_type') as ItemType | undefined;
  const isService = selectedItemType === ITEM_TYPE.SERVICE;

  const onSubmit = async (values: CreateProductFormValues | UpdateProductFormValues) => {
    setSubmitError(null);
    try {
      if (isEdit && initialData) {
        await updateProduct({
          id: initialData.id,
          name: values.name,
          description: values.description || undefined,
          selling_price: values.selling_price,
          hsn_sac: values.hsn_sac,
          gst_rate: values.gst_rate,
          reorder_level: isService ? undefined : (values.reorder_level || undefined),
          is_active: (values as UpdateProductFormValues).is_active,
        }).unwrap();
        notifySuccess(MESSAGES.general.updateSuccess);
        navigate(ROUTES.products.detail(initialData.id));
      } else {
        const createVals = values as CreateProductFormValues;
        const created = await createProduct({
          name: createVals.name,
          code: createVals.code || undefined,
          description: createVals.description || undefined,
          item_type: createVals.item_type,
          unit: Number(createVals.unit),
          selling_price: createVals.selling_price,
          hsn_sac: createVals.hsn_sac,
          gst_rate: createVals.gst_rate,
          reorder_level: isService ? undefined : (createVals.reorder_level || undefined),
          opening_stock: isService ? undefined : (createVals.opening_stock || undefined),
        }).unwrap();
        notifySuccess(MESSAGES.general.createSuccess);
        navigate(ROUTES.products.detail(created.id));
      }
    } catch (err: unknown) {
      const detail = handleApiFormErrors(err);
      if (detail) {
        setSubmitError(detail);
      }
    }
  };

  const isLoading = isCreating || isUpdating;

  return (
    <SectionCard
      title={isEdit ? `Edit Product (${initialData?.name})` : 'New Product / Service'}
      subheader="Inventory catalog item, pricing, HSN/SAC, tax rate, and tracking rules."
    >
      {submitError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {submitError}
        </Alert>
      )}

      <FormProvider {...methods}>
        <Box component="form" onSubmit={methods.handleSubmit(onSubmit)} noValidate>
          {isEdit && initialData && (
            <Box sx={{ mb: 2, p: 1.5, backgroundColor: 'action.hover', borderRadius: 1 }}>
              <Typography variant="caption" color="text.secondary">
                Product Code:
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                {initialData.code} ({initialData.unit_name})
              </Typography>
            </Box>
          )}

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <FormTextField
                name="name"
                label="Product / Item Name"
                required
                disabled={isLoading}
                autoFocus
              />
            </Grid>

            {!isEdit ? (
              <Grid item xs={12} sm={6}>
                <FormTextField
                  name="code"
                  label="Product Code (Leave blank to auto-generate)"
                  placeholder="e.g. P0001"
                  disabled={isLoading}
                />
              </Grid>
            ) : (
              <Grid item xs={12} sm={6}>
                <FormTextField
                  name="hsn_sac"
                  label="HSN / SAC Code"
                  required
                  disabled={isLoading}
                />
              </Grid>
            )}

            {!isEdit && (
              <>
                <Grid item xs={12} sm={6}>
                  <FormSelect
                    name="item_type"
                    label="Item Type"
                    options={itemTypeOptions}
                    disabled={isLoading}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormSelect
                    name="unit"
                    label="Measurement Unit"
                    options={unitOptions}
                    disabled={isLoading}
                  />
                </Grid>
              </>
            )}

            {!isEdit && (
              <Grid item xs={12} sm={6}>
                <FormTextField
                  name="hsn_sac"
                  label="HSN / SAC Code"
                  required
                  disabled={isLoading}
                />
              </Grid>
            )}

            <Grid item xs={12} sm={6}>
              <FormMoneyField
                name="selling_price"
                label="Selling Price (Unit Rate)"
                required
                disabled={isLoading}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormTextField
                name="gst_rate"
                label="GST Rate (%)"
                placeholder="18.00"
                required
                disabled={isLoading}
              />
            </Grid>

            {!isService && (
              <Grid item xs={12} sm={6}>
                <FormQuantityField
                  name="reorder_level"
                  label="Reorder Alert Level"
                  placeholder="e.g. 100.000"
                  disabled={isLoading}
                />
              </Grid>
            )}

            {!isEdit && !isService && (
              <Grid item xs={12} sm={6}>
                <FormQuantityField
                  name="opening_stock"
                  label="Initial Opening Stock"
                  placeholder="e.g. 500.000"
                  disabled={isLoading}
                />
              </Grid>
            )}

            <Grid item xs={12}>
              <FormTextField
                name="description"
                label="Description"
                multiline
                rows={2}
                disabled={isLoading}
              />
            </Grid>

            {isEdit && (
              <Grid item xs={12}>
                <FormSwitch
                  name="is_active"
                  label="Active in Product Catalog"
                  disabled={isLoading}
                />
              </Grid>
            )}
          </Grid>

          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button
              variant="outlined"
              color="inherit"
              disabled={isLoading}
              onClick={() => navigate(isEdit && initialData ? ROUTES.products.detail(initialData.id) : ROUTES.products.list)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={isLoading}
              startIcon={
                isLoading ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />
              }
            >
              {isLoading ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Product'}
            </Button>
          </Box>
        </Box>
      </FormProvider>
    </SectionCard>
  );
};
