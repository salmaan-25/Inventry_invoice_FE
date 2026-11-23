import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import {
  Autocomplete,
  TextField,
  CircularProgress,
  type AutocompleteProps,
} from '@mui/material';

export type FormAutocompleteProps<
  T,
  Multiple extends boolean | undefined = false,
  DisableClearable extends boolean | undefined = false,
  FreeSolo extends boolean | undefined = false,
> = Omit<
  AutocompleteProps<T, Multiple, DisableClearable, FreeSolo>,
  'renderInput' | 'onChange' | 'value'
> & {
  name: string;
  label: string;
  placeholder?: string;
  helperText?: string;
  isLoading?: boolean;
};

export function FormAutocomplete<T>({
  name,
  label,
  placeholder,
  helperText,
  isLoading = false,
  options,
  getOptionLabel,
  isOptionEqualToValue,
  ...props
}: FormAutocompleteProps<T>): React.ReactElement {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <Autocomplete
          options={options}
          loading={isLoading}
          getOptionLabel={getOptionLabel}
          isOptionEqualToValue={isOptionEqualToValue}
          value={(value as T) ?? null}
          onChange={(_, data) => onChange(data)}
          renderInput={(params) => (
            <TextField
              {...params}
              label={label}
              placeholder={placeholder}
              error={!!error}
              helperText={error?.message ?? helperText}
              fullWidth
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <>
                    {isLoading ? (
                      <CircularProgress color="inherit" size={20} />
                    ) : null}
                    {params.InputProps.endAdornment}
                  </>
                ),
              }}
            />
          )}
          {...props}
        />
      )}
    />
  );
}
