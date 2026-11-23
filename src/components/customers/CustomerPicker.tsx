import React, { useState } from 'react';
import {
  Autocomplete,
  TextField,
  CircularProgress,
  Box,
  Button,
  Tooltip,
  Typography,
} from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { useGetCustomersQuery } from '../../store/api/customersApi';
import { useDebounce } from '../../hooks/useDebounce';
import type { Customer } from '../../types/api/customer';

export interface CustomerPickerProps {
  value?: Customer | null;
  /** Pass numeric customer ID when only the ID is available */
  valueId?: number;
  onChange: (customer?: Customer) => void;
  onAddNew?: () => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
  helperText?: string;
}

export const CustomerPicker: React.FC<CustomerPickerProps> = ({
  value,
  valueId,
  onChange,
  onAddNew,
  label = 'Select Customer',
  placeholder = 'Search customer by name, code or phone...',
  disabled = false,
  error = false,
  helperText,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 300);

  const { data, isLoading } = useGetCustomersQuery({
    search: debouncedSearch || undefined,
    is_active: true,
    page_size: 50,
  });

  const options = data?.results ?? [];

  // Resolve effective value: explicit `value` wins; otherwise find by valueId
  const resolvedValue: Customer | null =
    value !== undefined
      ? (value ?? null)
      : (options.find((o) => o.id === valueId) ?? null);

  const autocomplete = (
    <Autocomplete
      options={options}
      loading={isLoading}
      disabled={disabled}
      value={resolvedValue}
      getOptionLabel={(option) => (option?.name ? `${option.name} (${option.code ?? ''})` : '')}
      isOptionEqualToValue={(option, val) => option.id === val.id}
      onChange={(_, selected) => onChange(selected ?? undefined)}
      onInputChange={(_, newInputValue) => setSearchTerm(newInputValue)}
      noOptionsText={
        onAddNew ? (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 0.5 }}>
            <Typography variant="body2" color="text.secondary">
              No customers found
            </Typography>
            <Button
              size="small"
              startIcon={<PersonAddIcon fontSize="small" />}
              onClick={(e) => {
                e.stopPropagation();
                onAddNew();
              }}
            >
              Add New
            </Button>
          </Box>
        ) : (
          'No customers found'
        )
      }
      renderOption={(props, option) => (
        <Box component="li" {...props} key={option.id}>
          <Box>
            <Typography variant="body2" fontWeight={600}>
              {option.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Code: {option.code} • Phone: {option.phone} • {option.state}
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

  if (!onAddNew) {
    return autocomplete;
  }

  return (
    <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
      <Box sx={{ flexGrow: 1 }}>{autocomplete}</Box>
      <Tooltip title="Add New Customer">
        <Button
          variant="outlined"
          color="primary"
          disabled={disabled}
          onClick={onAddNew}
          startIcon={<PersonAddIcon />}
          sx={{ height: 40, whiteSpace: 'nowrap', px: 1.5 }}
        >
          New
        </Button>
      </Tooltip>
    </Box>
  );
};

