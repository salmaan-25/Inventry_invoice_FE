import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { TextField, InputAdornment, type TextFieldProps } from '@mui/material';
import { toFixed3 } from '../../utils/money';

export type FormQuantityFieldProps = Omit<TextFieldProps, 'name'> & {
  name: string;
  unitName?: string;
};

export const FormQuantityField: React.FC<FormQuantityFieldProps> = ({
  name,
  unitName,
  helperText,
  ...props
}) => {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { onChange, onBlur, value, ...restField }, fieldState: { error } }) => {
        const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
          onBlur();
          const trimmed = e.target.value.trim();
          if (trimmed !== '' && !Number.isNaN(Number(trimmed))) {
            onChange(toFixed3(trimmed));
          }
        };

        return (
          <TextField
            {...restField}
            value={value ?? ''}
            onChange={onChange}
            onBlur={handleBlur}
            error={!!error}
            helperText={error?.message ?? helperText}
            fullWidth
            InputProps={{
              endAdornment: unitName ? (
                <InputAdornment position="end">{unitName}</InputAdornment>
              ) : undefined,
            }}
            inputProps={{
              inputMode: 'decimal',
            }}
            {...props}
          />
        );
      }}
    />
  );
};
