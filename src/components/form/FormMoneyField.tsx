import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { TextField, InputAdornment, type TextFieldProps } from '@mui/material';
import { toFixed2 } from '../../utils/money';

export type FormMoneyFieldProps = Omit<TextFieldProps, 'name'> & {
  name: string;
};

export const FormMoneyField: React.FC<FormMoneyFieldProps> = ({
  name,
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
            onChange(toFixed2(trimmed));
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
              startAdornment: <InputAdornment position="start">₹</InputAdornment>,
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
