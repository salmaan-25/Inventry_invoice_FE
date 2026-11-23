import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  type SelectProps,
} from '@mui/material';

export interface SelectOption {
  value: string | number;
  label: string;
}

export type FormSelectProps = SelectProps & {
  name: string;
  label: string;
  options: readonly SelectOption[];
  helperText?: string;
};

export const FormSelect: React.FC<FormSelectProps> = ({
  name,
  label,
  options,
  helperText,
  ...props
}) => {
  const { control } = useFormContext();
  const labelId = `${name}-select-label`;

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <FormControl fullWidth error={!!error} size={props.size ?? 'small'}>
          <InputLabel id={labelId}>{label}</InputLabel>
          <Select
            {...field}
            labelId={labelId}
            label={label}
            value={field.value ?? ''}
            {...props}
          >
            {options.map((option) => (
              <MenuItem key={String(option.value)} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
          {(error?.message || helperText) && (
            <FormHelperText>{error?.message ?? helperText}</FormHelperText>
          )}
        </FormControl>
      )}
    />
  );
};
