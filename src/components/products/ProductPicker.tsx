import React, { useState } from 'react';
import {
  Autocomplete,
  TextField,
  CircularProgress,
  Box,
  Typography,
} from '@mui/material';
import { useGetProductsQuery } from '../../store/api/productsApi';
import { useDebounce } from '../../hooks/useDebounce';
import { formatCurrency } from '../../utils/format';
import type { Product } from '../../types/api/product';

export interface ProductPickerProps {
  value?: Product | null;
  /** Pass a numeric product ID when you only have the id (e.g. from a line input).
   *  The picker will find the matching option from the loaded list. */
  valueId?: number;
  onChange: (product?: Product) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
  helperText?: string;
}

export const ProductPicker: React.FC<ProductPickerProps> = ({
  value,
  valueId,
  onChange,
  label = 'Select Product',
  placeholder = 'Search product by name or code...',
  disabled = false,
  error = false,
  helperText,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 300);

  const { data, isLoading } = useGetProductsQuery({
    search: debouncedSearch || undefined,
    is_active: true,
    page_size: 50,
  });

  const options = data?.results ?? [];

  // Resolve effective value: explicit `value` wins; otherwise look up by valueId
  const resolvedValue: Product | null =
    value !== undefined
      ? (value ?? null)
      : (options.find((o) => o.id === valueId) ?? null);

  return (
    <Autocomplete
      options={options}
      loading={isLoading}
      disabled={disabled}
      value={resolvedValue}
      getOptionLabel={(option) => (option?.name ? `${option.name} (${option.code ?? ''})` : '')}
      isOptionEqualToValue={(option, val) => option.id === val.id}
      onChange={(_, selected) => onChange(selected ?? undefined)}
      onInputChange={(_, newInputValue) => setSearchTerm(newInputValue)}
      renderOption={(props, option) => (
        <Box component="li" {...props} key={option.id}>
          <Box sx={{ width: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2" fontWeight={600}>
                {option.name} ({option.code})
              </Typography>
              <Typography variant="body2" fontWeight={600} color="primary.main">
                {formatCurrency(option.selling_price)}
              </Typography>
            </Box>
            <Typography variant="caption" color="text.secondary">
              Unit: {option.unit_name} • GST: {option.gst_rate}% • Stock:{' '}
              {option.item_type === 'SERVICE' ? 'N/A (Service)' : `${option.current_stock ?? '0.000'} ${option.unit_name}`}
            </Typography>
          </Box>
        </Box>
      )}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          placeholder={placeholder}
          error={error}
          helperText={helperText}
          fullWidth
          size="small"
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {isLoading ? <CircularProgress color="inherit" size={20} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
    />
  );
};
