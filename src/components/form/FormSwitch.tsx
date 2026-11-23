import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import {
  FormControlLabel,
  Switch,
  FormHelperText,
  Box,
  type SwitchProps,
} from '@mui/material';

export type FormSwitchProps = SwitchProps & {
  name: string;
  label: string;
  helperText?: string;
};

export const FormSwitch: React.FC<FormSwitchProps> = ({
  name,
  label,
  helperText,
  ...props
}) => {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <Box>
          <FormControlLabel
            control={
              <Switch
                {...field}
                checked={Boolean(field.value)}
                onChange={(e) => field.onChange(e.target.checked)}
                {...props}
              />
            }
            label={label}
          />
          {(error?.message || helperText) && (
            <FormHelperText error={!!error}>
              {error?.message ?? helperText}
            </FormHelperText>
          )}
        </Box>
      )}
    />
  );
};
