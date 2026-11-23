import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { DatePicker, type DatePickerProps } from '@mui/x-date-pickers/DatePicker';
import dayjs, { type Dayjs } from 'dayjs';
import { toApiDate } from '../../utils/date';

export type FormDatePickerProps = Omit<DatePickerProps<Dayjs>, 'value' | 'onChange'> & {
  name: string;
  label: string;
  helperText?: string;
};

export const FormDatePicker: React.FC<FormDatePickerProps> = ({
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
      render={({ field: { onChange, value }, fieldState: { error } }) => {
        const dayjsValue = value ? dayjs(value) : null;

        return (
          <DatePicker
            label={label}
            value={dayjsValue}
            onChange={(date) => {
              onChange(toApiDate(date) ?? '');
            }}
            slotProps={{
              textField: {
                fullWidth: true,
                size: 'small',
                error: !!error,
                helperText: error?.message ?? helperText,
              },
            }}
            {...props}
          />
        );
      }}
    />
  );
};
