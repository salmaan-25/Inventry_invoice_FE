import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { TextField, type TextFieldProps } from '@mui/material';

export type FormTextFieldProps = TextFieldProps & {
  name: string;
};

export const FormTextField: React.FC<FormTextFieldProps> = ({
  name,
  helperText,
  ...props
}) => {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <TextField
          {...field}
          value={field.value ?? ''}
          error={!!error}
          helperText={error?.message ?? helperText}
          fullWidth
          {...props}
        />
      )}
    />
  );
};
